import { getProductsBySlugs } from "./products";
import { getSettings } from "./settings";
import { rub, parseJson } from "./format";

export type FormState = { ok: boolean; message: string } | null;

const WEB3FORMS_URL = "https://api.web3forms.com/submit";
const digits = (s: string) => s.replace(/\D/g, "");

function validateContact(name: string, phone: string): string | null {
  if (name.trim().length < 2) return "Укажите, как к вам обращаться.";
  if (digits(phone).length < 10) return "Проверьте номер телефона — кажется, в нём не хватает цифр.";
  return null;
}

async function sendForm(subject: string, message: string): Promise<FormState> {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) {
    return {
      ok: false,
      message: "Форма временно недоступна. Напишите нам в Telegram или позвоните по телефону на странице контактов.",
    };
  }

  try {
    const res = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject,
        message,
      }),
    });
    const data = (await res.json()) as { success?: boolean; message?: string };
    if (!data.success) {
      return { ok: false, message: data.message ?? "Не удалось отправить заявку. Попробуйте ещё раз." };
    }
    return { ok: true, message: "" };
  } catch {
    return { ok: false, message: "Ошибка сети. Проверьте подключение и попробуйте снова." };
  }
}

export async function submitBooking(formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const quiz = String(formData.get("quiz") ?? "").trim();

  const error = validateContact(name, phone);
  if (error) return { ok: false, message: error };
  if (!service) return { ok: false, message: "Выберите услугу." };
  if (!date) return { ok: false, message: "Выберите дату визита." };

  const settings = getSettings();
  const lines = [
    `Новая запись — ${settings.salonName}`,
    "",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    email ? `E-mail: ${email}` : "",
    `Услуга: ${service}`,
    `Когда: ${date}${time ? ` в ${time}` : ""}`,
    comment ? `Комментарий: ${comment}` : "",
  ].filter(Boolean);

  if (quiz) {
    const parsed = parseJson<{ summary?: string[]; products?: string[] }>(quiz, {});
    if (parsed.summary?.length) {
      lines.push("", "Ответы подбора:", ...parsed.summary.map((s) => `• ${s}`));
    }
    if (parsed.products?.length) {
      lines.push("", "Подобранный уход:", ...parsed.products.map((s) => `• ${s}`));
    }
  }

  const result = await sendForm(`Запись — ${settings.salonName}`, lines.join("\n"));
  if (!result || !result.ok) return result ?? { ok: false, message: "Не удалось отправить заявку." };

  return {
    ok: true,
    message: `${name}, записали вас на ${date}${time ? ` в ${time}` : ""}. Мы свяжемся по номеру ${phone}, чтобы подтвердить. — Кристина, ${settings.salonName}`,
  };
}

export async function submitOrder(formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const delivery = String(formData.get("delivery") ?? "Доставка по Перми").trim();
  const rawItems = parseJson<{ slug: string; qty: number }[]>(String(formData.get("items") ?? "[]"), []);

  const error = validateContact(name, phone);
  if (error) return { ok: false, message: error };
  if (rawItems.length === 0) return { ok: false, message: "Корзина пуста." };

  const products = getProductsBySlugs(rawItems.map((i) => i.slug));
  const items = rawItems
    .map((i) => {
      const p = products.find((x) => x.slug === i.slug);
      if (!p) return null;
      const qty = Math.max(1, Math.min(99, Math.round(Number(i.qty) || 1)));
      return { slug: p.slug, name: `${p.line} — ${p.nameEn || p.nameRu}`, price: p.price, qty };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (items.length === 0) {
    return { ok: false, message: "Товары из корзины больше недоступны. Обновите страницу и соберите заказ заново." };
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const settings = getSettings();

  const message = [
    `Новый заказ — ${settings.salonName}`,
    "",
    ...items.map((i) => `• ${i.name} × ${i.qty} — ${rub(i.price * i.qty)}`),
    "",
    `Итого: ${rub(total)}`,
    `Получение: ${delivery}`,
    "",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    email ? `E-mail: ${email}` : "",
    comment ? `Комментарий: ${comment}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendForm(`Заказ — ${settings.salonName}`, message);
  if (!result || !result.ok) return result ?? { ok: false, message: "Не удалось отправить заказ." };

  return {
    ok: true,
    message: `${name}, заказ на ${rub(total)} принят. Мы перезвоним на ${phone}, чтобы подтвердить наличие и способ получения. — Кристина, ${settings.salonName}`,
  };
}
