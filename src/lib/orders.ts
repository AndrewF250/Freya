import { rub } from "./format";
import { getSettings } from "./settings";
import type { LeadItem } from "./leads-store";

export type OrderPayload = {
  name: string;
  phone: string;
  email: string;
  comment: string;
  delivery: string;
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
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    comment: String(formData.get("comment") ?? "").trim(),
    delivery: String(formData.get("delivery") ?? "Доставка по Перми").trim(),
    items,
    total,
  };
}

export function formatOrderMessage(payload: OrderPayload): string {
  const settings = getSettings();
  const lines = [
    `Заказ в ${settings.salonName}`,
    "",
    ...payload.items.map((i) => `• ${i.name} × ${i.qty} — ${rub(i.price * i.qty)}`),
    "",
    `Итого: ${rub(payload.total)}`,
    `Получение: ${payload.delivery}`,
    "",
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    payload.email ? `E-mail: ${payload.email}` : "",
    payload.comment ? `Комментарий: ${payload.comment}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}
