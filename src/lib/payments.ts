/**
 * Прослойка для онлайн-оплаты через ЮKassa.
 *
 * Сайт статический (GitHub Pages), а платёж в ЮKassa создаётся только с секретным ключом магазина,
 * которого не должно быть в браузере. Поэтому браузер отправляет заказ на свой бэкенд
 * (serverless-функцию), а уже она вызывает POST https://api.yookassa.ru/v3/payments
 * с shopId:secretKey и заголовком Idempotence-Key, и возвращает confirmation_url.
 *
 * Пока NEXT_PUBLIC_PAYMENT_API_URL не задан, онлайн-оплата выключена и заказ уходит как раньше —
 * с оплатой после подтверждения.
 *
 * Контракт бэкенда:
 *   POST {NEXT_PUBLIC_PAYMENT_API_URL}
 *   body: CreatePaymentRequest (JSON)
 *   200:  { paymentId: string; confirmationUrl: string }
 *   4xx/5xx: { message?: string }
 * Бэкенд обязан пересчитать сумму по своему прайсу, а не доверять amount из браузера.
 */

import { withBasePath } from "./paths";

export const PAYMENT_METHODS = [
  { key: "on-confirm", label: "После подтверждения заказа", hint: "Пришлём реквизиты или оплатите при получении" },
  { key: "yookassa", label: "Онлайн картой или СБП", hint: "Через ЮKassa — сразу после оформления" },
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["key"];

const API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL ?? "";

export function isOnlinePaymentEnabled(): boolean {
  return Boolean(API_URL);
}

/** Сумма в формате ЮKassa: строка с двумя знаками после точки. */
export type Amount = { value: string; currency: "RUB" };
export const rubAmount = (rubles: number): Amount => ({ value: rubles.toFixed(2), currency: "RUB" });

/** Позиция чека по 54-ФЗ (receipt.items в API ЮKassa). */
export type ReceiptItem = {
  description: string;
  quantity: number;
  amount: Amount;
  /** 1 — без НДС. Уточнить у бухгалтера перед запуском. */
  vat_code: number;
  payment_subject: "commodity";
  payment_mode: "full_payment";
};

export type CreatePaymentRequest = {
  orderId: string;
  amount: Amount;
  description: string;
  returnUrl: string;
  receipt: {
    customer: { full_name: string; phone: string; email?: string };
    items: ReceiptItem[];
  };
  metadata: { orderId: string; delivery: string };
};

export type CreatePaymentResult =
  | { ok: true; paymentId: string; confirmationUrl: string }
  | { ok: false; reason: "disabled" | "error"; message: string };

type OrderForPayment = {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  delivery: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
};

/** Ссылка, на которую ЮKassa вернёт клиента после оплаты. */
export function paymentReturnUrl(orderId: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const path = `/cart/?payment=return&order=${encodeURIComponent(orderId)}`;
  return site ? `${site.replace(/\/$/, "")}${path}` : withBasePath(path);
}

export function buildPaymentRequest(order: OrderForPayment): CreatePaymentRequest {
  return {
    orderId: order.orderId,
    amount: rubAmount(order.total),
    // ЮKassa ограничивает описание 128 символами.
    description: `Заказ ${order.orderId} — ФРЕЯ`.slice(0, 128),
    returnUrl: paymentReturnUrl(order.orderId),
    receipt: {
      customer: { full_name: order.name, phone: order.phone.replace(/[^\d+]/g, ""), email: order.email || undefined },
      items: order.items.map((i) => ({
        description: i.name.slice(0, 128),
        quantity: i.qty,
        amount: rubAmount(i.price),
        vat_code: 1,
        payment_subject: "commodity",
        payment_mode: "full_payment",
      })),
    },
    metadata: { orderId: order.orderId, delivery: order.delivery },
  };
}

export async function createPayment(order: OrderForPayment): Promise<CreatePaymentResult> {
  if (!API_URL) {
    return { ok: false, reason: "disabled", message: "Онлайн-оплата пока не подключена." };
  }
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildPaymentRequest(order)),
    });
    const data = (await res.json().catch(() => ({}))) as {
      paymentId?: string;
      confirmationUrl?: string;
      message?: string;
    };
    if (!res.ok || !data.confirmationUrl || !data.paymentId) {
      return { ok: false, reason: "error", message: data.message ?? "Не удалось создать платёж." };
    }
    return { ok: true, paymentId: data.paymentId, confirmationUrl: data.confirmationUrl };
  } catch {
    return { ok: false, reason: "error", message: "Платёжный сервис недоступен. Попробуйте позже." };
  }
}

/** Номер заказа для клиента и для metadata платежа: FR-251119-4K7Q. */
export function newOrderId(date = new Date()): string {
  const ymd = date.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FR-${ymd}-${rand}`;
}
