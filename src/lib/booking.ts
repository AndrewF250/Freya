import { parseJson } from "./format";
import { getSettings } from "./settings";

export type BookingPayload = {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  comment: string;
  quiz?: { summary: string[]; products: string[] };
};

export function collectBookingPayload(form: HTMLFormElement): BookingPayload {
  const formData = new FormData(form);
  const quizRaw = String(formData.get("quiz") ?? "").trim();
  const quiz = quizRaw ? parseJson<{ summary?: string[]; products?: string[] }>(quizRaw, {}) : undefined;

  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    service: String(formData.get("service") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    time: String(formData.get("time") ?? "").trim(),
    comment: String(formData.get("comment") ?? "").trim(),
    quiz:
      quiz?.summary?.length || quiz?.products?.length
        ? { summary: quiz.summary ?? [], products: quiz.products ?? [] }
        : undefined,
  };
}

export function formatBookingMessage(payload: BookingPayload): string {
  const settings = getSettings();
  const lines = [
    `Запись в ${settings.salonName}`,
    "",
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    payload.email ? `E-mail: ${payload.email}` : "",
    `Услуга: ${payload.service}`,
    `Когда: ${payload.date}${payload.time ? ` в ${payload.time}` : ""}`,
    payload.comment ? `Комментарий: ${payload.comment}` : "",
  ].filter(Boolean);

  if (payload.quiz?.summary?.length) {
    lines.push("", "Ответы подбора:", ...payload.quiz.summary.map((s) => `• ${s}`));
  }
  if (payload.quiz?.products?.length) {
    lines.push("", "Подобранный уход:", ...payload.quiz.products.map((s) => `• ${s}`));
  }

  return lines.join("\n");
}

export function buildTelegramBookingUrl(telegramLink: string, message: string): string | null {
  const match = telegramLink.match(/t\.me\/([^/?#]+)/i);
  if (!match?.[1]) return null;
  return `https://t.me/${match[1]}?text=${encodeURIComponent(message)}`;
}
