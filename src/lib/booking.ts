import { parseJson } from "./format";
import { DEFAULT_TELEGRAM_BOOKING_PRESET, getSettings } from "./settings";
import { buildTelegramUrl } from "./telegram";

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

function quizBlock(payload: BookingPayload): string {
  const parts: string[] = [];
  if (payload.quiz?.summary?.length) {
    parts.push("Ответы подбора:", ...payload.quiz.summary.map((s) => `• ${s}`));
  }
  if (payload.quiz?.products?.length) {
    parts.push("Подобранный уход:", ...payload.quiz.products.map((s) => `• ${s}`));
  }
  return parts.join("\n");
}

export function formatBookingMessage(payload: BookingPayload, preset?: string): string {
  const settings = getSettings();
  const template = (preset ?? settings.telegramMessagePreset ?? DEFAULT_TELEGRAM_BOOKING_PRESET).trim();
  const when = `${payload.date}${payload.time ? ` в ${payload.time}` : ""}`.trim();
  const vars: Record<string, string> = {
    salon: settings.salonName,
    name: payload.name,
    phone: payload.phone,
    email: payload.email ? `E-mail: ${payload.email}` : "",
    service: payload.service,
    date: payload.date,
    time: payload.time,
    when,
    comment: payload.comment ? `Комментарий: ${payload.comment}` : "",
    quiz: quizBlock(payload),
  };

  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, value);
  }

  return out
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildTelegramBookingUrl(telegramLink: string, message: string): string | null {
  return buildTelegramUrl(telegramLink, message);
}
