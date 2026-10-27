/** Значения по умолчанию — используются, пока мастер не сохранил свои. */
import { settings as settingsData } from "./data";
import type { SlotPreset } from "./booking-slots";
import type { CatalogConfig } from "./catalog";

export const SETTING_DEFAULTS = {
  masterName: "Кристина",
  masterTitle: "Амбассадор Davines · парикмахер-стилист",
  salonName: "ФРЕЯ",
  phone: "+7 (908) 255-09-10",
  email: "hello@freya-salon.ru",
  address: "Пермь, Комсомольский проспект, 51А",
  hours: "Ежедневно 10:00 — 21:00",
  telegram: "https://t.me/",
  instagram: "https://instagram.com/",
  whatsapp: "https://wa.me/",
  vk: "https://vk.com/freya_studio_59",
  heroTitle: "Красота начинается у корней",
  heroText: "Профессиональный уход за волосами и кожей головы.",
  aboutText: "",
  deliveryText: "Доставка по Перми — 500 ₽. СДЭК по России — по тарифам перевозчика. Оплата при получении или переводом.",
};

export const DEFAULT_TELEGRAM_BOOKING_PRESET = `Запись в {salon}

Имя: {name}
Телефон: {phone}
{email}
Услуга: {service}
Когда: {when}
{comment}

{quiz}`;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string> & {
  yandexMapUrl?: string;
  yandexMapEmbed?: string;
  bookingSlots?: string[];
  bookingSlotPresets?: SlotPreset[];
  imageBgPresets?: string[];
  telegramMessagePreset?: string;
  catalog?: CatalogConfig;
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
  vk: "Ссылка на ВКонтакте",
  heroTitle: "Заголовок на главной",
  heroText: "Текст под заголовком",
  aboutText: "О мастере (страница «О нас»)",
  deliveryText: "Доставка и оплата",
};

/** Многострочные поля — в кабинете рисуются как textarea. */
export const LONG_SETTINGS: SettingKey[] = ["heroText", "aboutText", "deliveryText"];

/** Телефон в виде, пригодном для href="tel:". */
export const telHref = (phone: string) => "tel:" + phone.replace(/[^\d+]/g, "");

export function yandexEmbedSrc(settings: { yandexMapEmbed?: string; address?: string }): string {
  if (settings.yandexMapEmbed) return settings.yandexMapEmbed;
  const q = settings.address || SETTING_DEFAULTS.address;
  return `https://yandex.ru/map-widget/v1/?mode=search&text=${encodeURIComponent(q)}`;
}

/** Читает настройки студии из статического JSON. */
export function getSettings(): Settings {
  return settingsData;
}
