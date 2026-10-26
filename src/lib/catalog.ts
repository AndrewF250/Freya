/** Общий словарь каталога — используется и на витрине, и в кабинете мастера. */

export type CatalogEntry = {
  key: string;
  label: string;
};

export type CatalogConfig = {
  categories?: CatalogEntry[];
  concerns?: CatalogEntry[];
  hairTypes?: CatalogEntry[];
  lines?: string[];
};

export type ResolvedCatalog = {
  categories: CatalogEntry[];
  concerns: CatalogEntry[];
  hairTypes: CatalogEntry[];
  lines: string[];
};

export const DEFAULT_CATEGORIES: CatalogEntry[] = [
  { key: "shampoo", label: "Шампуни" },
  { key: "conditioner", label: "Кондиционеры" },
  { key: "mask", label: "Маски" },
  { key: "leaveIn", label: "Несмываемый уход" },
  { key: "serum", label: "Сыворотки" },
  { key: "oil", label: "Масла" },
  { key: "scalp", label: "Уход за кожей головы" },
  { key: "styling", label: "Стайлинг" },
  { key: "other", label: "Другое" },
];

export const DEFAULT_CONCERNS: CatalogEntry[] = [
  { key: "dryness", label: "Сухость и обезвоженность" },
  { key: "damage", label: "Повреждение и ломкость" },
  { key: "volume", label: "Недостаток объёма" },
  { key: "color", label: "Защита цвета" },
  { key: "curls", label: "Кудри и завиток" },
  { key: "frizz", label: "Пушистость" },
  { key: "scalp", label: "Кожа головы" },
  { key: "shine", label: "Блеск и мягкость" },
];

export const DEFAULT_HAIR_TYPES: CatalogEntry[] = [
  { key: "normal", label: "Нормальные" },
  { key: "dry", label: "Сухие" },
  { key: "oily", label: "Жирные у корней" },
  { key: "colored", label: "Окрашенные" },
  { key: "curly", label: "Кудрявые" },
  { key: "thin", label: "Тонкие" },
  { key: "damaged", label: "Повреждённые" },
];

/** Порядок вывода линеек Davines в фильтрах. */
export const LINE_ORDER = [
  "MoMo",
  "NouNou",
  "Love",
  "Dede",
  "Minu",
  "Melu",
  "Volu",
  "Solu",
  "OI",
  "Alchemic",
  "Heart of Glass",
  "Naturaltech",
  "More Inside",
  "The Circle Chronicles",
  "Essential Haircare",
  "Davines",
];

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugifyKey(input: string): string {
  const base = input
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || `tag-${Date.now().toString(36)}`;
}

export function uniqueCatalogKey(label: string, existing: CatalogEntry[]): string {
  const base = slugifyKey(label);
  if (!existing.some((e) => e.key === base)) return base;
  for (let i = 2; i < 200; i++) {
    const key = `${base}-${i}`;
    if (!existing.some((e) => e.key === key)) return key;
  }
  return `${base}-${Date.now().toString(36)}`;
}

function cleanEntries(list: CatalogEntry[] | undefined, fallback: CatalogEntry[]): CatalogEntry[] {
  const seen = new Set<string>();
  const clean: CatalogEntry[] = [];
  for (const item of list ?? []) {
    const key = String(item?.key ?? "").trim();
    const label = String(item?.label ?? "").trim();
    if (!key || !label || seen.has(key)) continue;
    seen.add(key);
    clean.push({ key, label });
  }
  return clean.length ? clean : fallback;
}

export function catalogFrom(source?: { catalog?: CatalogConfig }): ResolvedCatalog {
  const lines = (source?.catalog?.lines ?? []).map((l) => String(l).trim()).filter(Boolean);
  return {
    categories: cleanEntries(source?.catalog?.categories, DEFAULT_CATEGORIES),
    concerns: cleanEntries(source?.catalog?.concerns, DEFAULT_CONCERNS),
    hairTypes: cleanEntries(source?.catalog?.hairTypes, DEFAULT_HAIR_TYPES),
    lines: lines.length ? lines : LINE_ORDER,
  };
}

export function catalogLabel(entries: CatalogEntry[], key: string, fallback = key): string {
  return entries.find((e) => e.key === key)?.label ?? fallback;
}

export const sortLines = (lines: string[], order: string[] = LINE_ORDER) =>
  [...lines].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b, "ru");
  });

/** Совместимость со старым Record-API. */
export const CATEGORIES = Object.fromEntries(DEFAULT_CATEGORIES.map((e) => [e.key, e.label])) as Record<string, string>;
export const CONCERNS = Object.fromEntries(DEFAULT_CONCERNS.map((e) => [e.key, e.label])) as Record<string, string>;
export const HAIR_TYPES = Object.fromEntries(DEFAULT_HAIR_TYPES.map((e) => [e.key, e.label])) as Record<string, string>;

export type CategoryKey = string;
export type ConcernKey = (typeof DEFAULT_CONCERNS)[number]["key"];
export type HairTypeKey = (typeof DEFAULT_HAIR_TYPES)[number]["key"];

export const CATEGORY_KEYS = DEFAULT_CATEGORIES.map((e) => e.key);
export const CONCERN_KEYS = DEFAULT_CONCERNS.map((e) => e.key);
export const HAIR_TYPE_KEYS = DEFAULT_HAIR_TYPES.map((e) => e.key);
