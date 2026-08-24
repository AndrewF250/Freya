/** Значения по умолчанию — используются, пока мастер не сохранил свои. */
import { settings as settingsData } from "./data";

export const SETTING_DEFAULTS = {
  masterName: "Кристина",
  masterTitle: "Амбассадор Davines · парикмахер-стилист",
  salonName: "ФРЕЯ",
  phone: "+7 (999) 123-45-67",
  email: "hello@freya-salon.ru",
  address: "Москва, ул. Петровка, 15",
  hours: "Пн–Сб 10:00 — 20:00",
  telegram: "https://t.me/",
  instagram: "https://instagram.com/",
  whatsapp: "https://wa.me/",
  heroTitle: "Красота начинается у корней",
  heroText: "Профессиональный уход за волосами и кожей головы.",
  aboutText: "",
  deliveryText: "",
};

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string> & {
  yandexMapUrl?: string;
  yandexMapEmbed?: string;
};

export const SETTING_LABELS: Record<SettingKey, string> = {
  masterName: "Имя мастера",
  masterTitle: "Должность / статус",
  salonName: "Название студии",
  phone: "Телефон",
  email: "E-mail",
  address: "Адрес",
  hours: "Часы работы",
  telegram: "Ссылка на Telegram",
  instagram: "Ссылка на Instagram",
  whatsapp: "Ссылка на WhatsApp",
  heroTitle: "Заголовок на главной",
  heroText: "Текст под заголовком",
  aboutText: "О мастере (страница «О нас»)",
  deliveryText: "Доставка и оплата",
};

/** Многострочные поля — в кабинете рисуются как textarea. */
export const LONG_SETTINGS: SettingKey[] = ["heroText", "aboutText", "deliveryText"];

/** Телефон в виде, пригодном для href="tel:". */
export const telHref = (phone: string) => "tel:" + phone.replace(/[^\d+]/g, "");

/** Читает настройки студии из статического JSON. */
export function getSettings(): Settings {
  return settingsData;
}
