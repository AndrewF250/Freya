import price from "@/data/price.json";

/** Прайс студии — единый источник для страницы «Студия», формы записи и сторис (scripts/build-price-stories.mjs). */
export type PriceItem = { title: string; price: string; note?: string };
export type PriceSubgroup = { title: string; note?: string; items: PriceItem[] };
export type PriceGroup = {
  id: string;
  title: string;
  items: PriceItem[];
  subgroups?: PriceSubgroup[];
  footnote?: string;
};

export const PRICE_GROUPS = price.groups as PriceGroup[];

/** Позиция, с которой начинается запись после квиза. */
export const DIAGNOSTIC_SERVICE = "Консультация и подбор ухода";

/** Услуги для выбора в форме записи. */
export const SERVICE_TITLES: string[] = [
  DIAGNOSTIC_SERVICE,
  ...PRICE_GROUPS.flatMap((g) => [
    ...(g.subgroups ?? []).map((s) => s.title),
    ...g.items.map((i) => i.title),
  ]),
];
