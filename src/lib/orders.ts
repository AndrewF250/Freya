import { rub } from "./format";
import { getSettings } from "./settings";
import { formatPhone } from "./validation";
import type { LeadItem } from "./leads-store";

export type OrderPayload = {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  comment: string;
  delivery: string;
  address: string;
  payment: string;
  items: LeadItem[];
  total: number;
};

type CartLine = {
  slug: string;
  nameRu: string;
  line: string;
  price: number;
  qty: number;
};

export function collectOrderPayload(formData: FormData, cartItems: CartLine[]): OrderPayload {
  const items: LeadItem[] = cartItems.map((i) => ({
    slug: i.slug,
    name: `${i.line} — ${i.nameRu}`,
    price: i.price,
    qty: i.qty,
  }));
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return {
    orderId: String(formData.get("orderId") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    phone: formatPhone(String(formData.get("phone") ?? "")),
    email: String(formData.get("email") ?? "").trim(),
    comment: String(formData.get("comment") ?? "").trim(),
    delivery: String(formData.get("delivery") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    payment: String(formData.get("paymentLabel") ?? "").trim(),
    items,
    total,
  };
}

export function formatOrderMessage(payload: OrderPayload): string {
  const settings = getSettings();
  const lines = [
    `Заказ ${payload.orderId} в ${settings.salonName}`.replace("  ", " "),
    "",
    ...payload.items.map((i) => `• ${i.name} × ${i.qty} — ${rub(i.price * i.qty)}`),
    "",
    `Итого: ${rub(payload.total)}`,
    `Получение: ${payload.delivery}`,
    payload.address ? `Адрес: ${payload.address}` : null,
    payload.payment ? `Оплата: ${payload.payment}` : null,
    "",
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    payload.email ? `E-mail: ${payload.email}` : null,
    payload.comment ? `Комментарий: ${payload.comment}` : null,
  ].filter((line) => line !== null);

  return lines.join("\n");
}
