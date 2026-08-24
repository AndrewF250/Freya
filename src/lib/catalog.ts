/** Общий словарь каталога — используется и на витрине, и в кабинете мастера. */

export const CATEGORIES = {
  shampoo: "Шампуни",
  conditioner: "Кондиционеры",
  mask: "Маски",
  serum: "Сыворотки",
  oil: "Масла",
  scalp: "Уход за кожей головы",
  styling: "Стайлинг",
  other: "Другое",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export const CONCERNS = {
  dryness: "Сухость и обезвоженность",
  damage: "Повреждение и ломкость",
  volume: "Недостаток объёма",
  color: "Защита цвета",
  curls: "Кудри и завиток",
  frizz: "Пушистость",
  scalp: "Кожа головы",
  shine: "Блеск и мягкость",
} as const;

export type ConcernKey = keyof typeof CONCERNS;
export const CONCERN_KEYS = Object.keys(CONCERNS) as ConcernKey[];

export const HAIR_TYPES = {
  normal: "Нормальные",
  dry: "Сухие",
  oily: "Жирные у корней",
  colored: "Окрашенные",
  curly: "Кудрявые",
  thin: "Тонкие",
  damaged: "Повреждённые",
} as const;

export type HairTypeKey = keyof typeof HAIR_TYPES;
export const HAIR_TYPE_KEYS = Object.keys(HAIR_TYPES) as HairTypeKey[];

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

export const sortLines = (lines: string[]) =>
  [...lines].sort((a, b) => {
    const ia = LINE_ORDER.indexOf(a);
    const ib = LINE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b, "ru");
  });
