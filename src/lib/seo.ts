export const siteName = "ФРЕЯ";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://andrewf250.github.io/Freya";

export const defaultDescription =
  "Салон ФРЕЯ в Перми — партнёр Davines. Подбор домашнего ухода, оригинальная продукция, запись в салон и доставка по Перми и России.";

export const defaultKeywords = [
  "Davines Перм",
  "купить davines перм",
  "салон красоты Перм",
  "салон фрея",
  "уход за волосами",
  "подбор ухода для волос",
  "подбор шампуня",
  "Фрея студия",
  "парикмахер перм davines",
  "амбассадор davines",
  "профессиональный уход Davines",
];

export const defaultOgImage = "/og-cover.jpg";

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function ogImageUrl(path = defaultOgImage) {
  return absoluteUrl(path);
}

export const sharedOpenGraph = {
  type: "website" as const,
  locale: "ru_RU",
  siteName,
  images: [{ url: ogImageUrl(), width: 1200, height: 630, alt: "Салон ФРЕЯ — Davines в Перми" }],
};
