export const siteName = "ФРЕЯ";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://andrewf250.github.io/Freya";

export const defaultDescription =
  "Салон красоты ФРЕЯ в Перми — Кристина, амбассадор Davines. Подбор домашнего ухода, оригинальная продукция и запись на приём.";

export const defaultKeywords = [
  "Davines Перм",
  "салон красоты Перм",
  "уход за волосами",
  "подбор шампуня",
  "Фрея студия",
  "Кристина парикмахер",
  "профессиональный уход Davines",
];

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}
