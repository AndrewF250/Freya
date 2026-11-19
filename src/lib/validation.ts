/** Проверка данных, которые клиент вводит в формах записи и заказа. Сообщения — для показа под полем. */

export type FieldErrors = Partial<Record<string, string>>;

export const LIMITS = {
  name: 60,
  email: 120,
  comment: 1000,
  address: 300,
  qty: 99,
  /** На сколько дней вперёд можно записаться. */
  bookingDaysAhead: 180,
} as const;

const NAME_RE = /^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё' .-]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Российский мобильный или городской: +7XXXXXXXXXX. Принимает 8…, 7…, +7… и 10 цифр без кода. */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length === 10) d = `7${d}`;
  if (d.length === 11 && d.startsWith("8")) d = `7${d.slice(1)}`;
  if (d.length !== 11 || !d.startsWith("7")) return null;
  if (!/^7[3489]/.test(d)) return null;
  return `+${d}`;
}

/** +79991234567 → +7 (999) 123-45-67 */
export function formatPhone(raw: string): string {
  const n = normalizePhone(raw);
  if (!n) return raw.trim();
  return `+7 (${n.slice(2, 5)}) ${n.slice(5, 8)}-${n.slice(8, 10)}-${n.slice(10, 12)}`;
}

export function validateName(name: string): string | null {
  const v = name.trim();
  if (v.length < 2) return "Укажите имя — минимум 2 буквы.";
  if (v.length > LIMITS.name) return `Имя слишком длинное — до ${LIMITS.name} символов.`;
  if (!NAME_RE.test(v)) return "В имени могут быть только буквы, пробел, дефис и апостроф.";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Укажите телефон — по нему мы подтвердим заявку.";
  if (!normalizePhone(phone)) return "Проверьте номер: нужен российский номер в формате +7 (999) 123-45-67.";
  return null;
}

export function validateEmail(email: string): string | null {
  const v = email.trim();
  if (!v) return null;
  if (v.length > LIMITS.email || !EMAIL_RE.test(v)) return "Проверьте e-mail — например, anna@example.com.";
  return null;
}

export function validateComment(comment: string, max: number = LIMITS.comment): string | null {
  return comment.trim().length > max ? `Слишком длинный текст — до ${max} символов.` : null;
}

function collect(entries: [string, string | null][]): FieldErrors {
  const errors: FieldErrors = {};
  for (const [field, message] of entries) if (message) errors[field] = message;
  return errors;
}

export type BookingInput = {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  comment: string;
};

function localISODate(d: Date): string {
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function validateBooking(input: BookingInput, allowedSlots: string[] = []): FieldErrors {
  const today = new Date();
  const max = new Date(today.getTime() + LIMITS.bookingDaysAhead * 86_400_000);
  let dateError: string | null = null;
  if (!input.date) dateError = "Выберите дату визита.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(input.date)))
    dateError = "Дата указана в неверном формате.";
  else if (input.date < localISODate(today)) dateError = "Эта дата уже прошла — выберите сегодняшнюю или позже.";
  else if (input.date > localISODate(max)) dateError = `Запись открыта на ${LIMITS.bookingDaysAhead} дней вперёд.`;

  return collect([
    ["service", input.service.trim() ? null : "Выберите хотя бы одну услугу."],
    ["date", dateError],
    ["time", input.time && allowedSlots.length && !allowedSlots.includes(input.time) ? "Выберите время из списка." : null],
    ["name", validateName(input.name)],
    ["phone", validatePhone(input.phone)],
    ["email", validateEmail(input.email)],
    ["comment", validateComment(input.comment)],
  ]);
}

export const DELIVERY_OPTIONS = ["Доставка по Перми", "СДЭК по России"] as const;

export type OrderInput = {
  name: string;
  phone: string;
  email: string;
  delivery: string;
  address: string;
  comment: string;
  items: { slug: string; qty: number }[];
};

export function validateOrder(input: OrderInput): FieldErrors {
  let itemsError: string | null = null;
  if (input.items.length === 0) itemsError = "Корзина пуста.";
  else if (input.items.some((i) => !Number.isInteger(i.qty) || i.qty < 1 || i.qty > LIMITS.qty))
    itemsError = `Количество каждого товара — от 1 до ${LIMITS.qty}.`;

  let addressError: string | null = null;
  const address = input.address.trim();
  if (address.length < 5) addressError = "Укажите адрес доставки: город, улицу и дом.";
  else if (address.length > LIMITS.address) addressError = `Адрес слишком длинный — до ${LIMITS.address} символов.`;

  return collect([
    ["items", itemsError],
    [
      "delivery",
      (DELIVERY_OPTIONS as readonly string[]).includes(input.delivery) ? null : "Выберите способ получения.",
    ],
    ["address", addressError],
    ["name", validateName(input.name)],
    ["phone", validatePhone(input.phone)],
    ["email", validateEmail(input.email)],
    ["comment", validateComment(input.comment)],
  ]);
}

export function firstError(errors: FieldErrors): string | null {
  return Object.values(errors).find(Boolean) ?? null;
}
