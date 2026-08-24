import type { ConcernKey, HairTypeKey } from "./catalog";

export type QuizOption = {
  value: string;
  label: string;
  hint?: string;
  /** Веса тегов задач, которые добавляет этот ответ. */
  concerns?: Partial<Record<ConcernKey, number>>;
  /** Веса типов волос. */
  hairTypes?: Partial<Record<HairTypeKey, number>>;
  /** Бонус конкретным линейкам Davines. */
  lines?: Record<string, number>;
};

export type QuizStep = {
  id: string;
  question: string;
  caption: string;
  options: QuizOption[];
};

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "hair",
    question: "Какие у вас волосы?",
    caption: "Отталкиваемся от того, как они ведут себя через день после мытья.",
    options: [
      {
        value: "dry",
        label: "Сухие и жёсткие",
        hint: "Плохо расчёсываются, электризуются",
        concerns: { dryness: 3, shine: 1 },
        hairTypes: { dry: 3 },
        lines: { MoMo: 3, NouNou: 1 },
      },
      {
        value: "damaged",
        label: "Повреждённые",
        hint: "Секутся, ломаются по длине",
        concerns: { damage: 3, dryness: 1 },
        hairTypes: { damaged: 3 },
        lines: { NouNou: 3, Melu: 2 },
      },
      {
        value: "thin",
        label: "Тонкие, без объёма",
        hint: "Быстро теряют форму",
        concerns: { volume: 3 },
        hairTypes: { thin: 3 },
        lines: { Volu: 3 },
      },
      {
        value: "curly",
        label: "Кудрявые или волнистые",
        hint: "Есть завиток, но он путается",
        concerns: { curls: 3, frizz: 1 },
        hairTypes: { curly: 3 },
        lines: { Love: 3 },
      },
      {
        value: "normal",
        label: "В целом нормальные",
        hint: "Хочется просто поддержать состояние",
        concerns: { shine: 2 },
        hairTypes: { normal: 3 },
        lines: { OI: 2, Dede: 2 },
      },
    ],
  },
  {
    id: "scalp",
    question: "Какое состояние кожи головы вам ближе?",
    caption: "От этого зависит выбор шампуня — база любого ухода.",
    options: [
      { value: "normal", label: "Нормальная", hint: "Без дискомфорта", lines: { Dede: 2 } },
      {
        value: "oily",
        label: "Жирная",
        hint: "Корни сальнятся к концу дня",
        concerns: { scalp: 3 },
        hairTypes: { oily: 3 },
        lines: { Naturaltech: 3, Solu: 2 },
      },
      {
        value: "dry",
        label: "Сухая",
        hint: "Стянутость, шелушение",
        concerns: { scalp: 2, dryness: 2 },
        lines: { Naturaltech: 2, MoMo: 1 },
      },
      {
        value: "sensitive",
        label: "Чувствительная",
        hint: "Зуд, покраснение",
        concerns: { scalp: 3 },
        lines: { Naturaltech: 3 },
      },
      { value: "unknown", label: "Не знаю", hint: "Кристина уточнит на консультации" },
    ],
  },
  {
    id: "goal",
    question: "Что для вас сейчас важнее всего?",
    caption: "Один главный запрос — на нём и построим подбор.",
    options: [
      { value: "dryness", label: "Увлажнение", concerns: { dryness: 4 }, lines: { MoMo: 3 } },
      { value: "damage", label: "Восстановление", concerns: { damage: 4 }, lines: { NouNou: 3 } },
      { value: "volume", label: "Объём", concerns: { volume: 4 }, lines: { Volu: 3 } },
      { value: "frizz", label: "Гладкость и дисциплина", concerns: { frizz: 4 }, lines: { Love: 3 } },
      { value: "color", label: "Сохранить цвет", concerns: { color: 4 }, lines: { Minu: 3, Alchemic: 2 } },
      { value: "scalp", label: "Здоровье кожи головы", concerns: { scalp: 4 }, lines: { Naturaltech: 3 } },
    ],
  },
  {
    id: "color",
    question: "Волосы окрашены?",
    caption: "Окрашенным волосам нужен более щадящий шампунь и защита пигмента.",
    options: [
      { value: "no", label: "Нет, натуральный цвет" },
      {
        value: "colored",
        label: "Да, окрашены в тон",
        concerns: { color: 3 },
        hairTypes: { colored: 3 },
        lines: { Minu: 3 },
      },
      {
        value: "blonde",
        label: "Блонд или осветление",
        concerns: { color: 3, damage: 2 },
        hairTypes: { colored: 3, damaged: 1 },
        lines: { "Heart of Glass": 4, Alchemic: 2 },
      },
      {
        value: "tone",
        label: "Хочу поддерживать оттенок",
        concerns: { color: 3 },
        hairTypes: { colored: 2 },
        lines: { Alchemic: 4 },
      },
    ],
  },
  {
    id: "depth",
    question: "Насколько подробный уход вам нужен?",
    caption: "Можно начать с базы и дополнить позже.",
    options: [
      { value: "2", label: "Минимум", hint: "Шампунь и уход" },
      { value: "3", label: "Оптимально", hint: "Плюс средство для длины" },
      { value: "4", label: "Полный набор", hint: "Плюс финиш и защита" },
    ],
  },
];

export type QuizAnswers = Record<string, string>;

export type ScorableProduct = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  line: string;
  category: string;
  volume: string;
  price: number;
  image: string;
  concerns: string[];
  hairTypes: string[];
};

/** Порядок, в котором собираем подбор: сначала база, потом длина, потом финиш. */
const SLOT_ORDER: string[][] = [
  ["shampoo"],
  ["mask", "conditioner"],
  ["serum", "oil", "scalp"],
  ["styling", "conditioner", "mask", "other"],
];

export function scoreProduct(p: ScorableProduct, answers: QuizAnswers): number {
  let score = 0;
  for (const step of QUIZ_STEPS) {
    const chosen = step.options.find((o) => o.value === answers[step.id]);
    if (!chosen) continue;
    for (const [key, weight] of Object.entries(chosen.concerns ?? {})) {
      if (p.concerns.includes(key)) score += weight;
    }
    for (const [key, weight] of Object.entries(chosen.hairTypes ?? {})) {
      if (p.hairTypes.includes(key)) score += weight;
    }
    for (const [line, weight] of Object.entries(chosen.lines ?? {})) {
      if (p.line === line) score += weight;
    }
  }
  return score;
}

/**
 * Собирает набор ухода: по одному продукту на слот, в порядке шампунь → уход → длина → финиш.
 * Слоты, для которых ничего не нашлось, заполняются лучшими из оставшихся.
 */
export function buildRitual(products: ScorableProduct[], answers: QuizAnswers): ScorableProduct[] {
  const count = Number(answers.depth || 3);
  const ranked = products
    .map((p) => ({ p, score: scoreProduct(p, answers) }))
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price);

  const picked: ScorableProduct[] = [];
  const taken = new Set<string>();

  for (const slot of SLOT_ORDER.slice(0, count)) {
    const hit = ranked.find(({ p }) => !taken.has(p.id) && slot.includes(p.category));
    if (hit) {
      picked.push(hit.p);
      taken.add(hit.p.id);
    }
  }
  for (const { p } of ranked) {
    if (picked.length >= count) break;
    if (!taken.has(p.id)) {
      picked.push(p);
      taken.add(p.id);
    }
  }
  return picked.slice(0, count);
}

/** Человекочитаемая расшифровка ответов — для письма в Telegram и кабинета. */
export function describeAnswers(answers: QuizAnswers): string[] {
  return QUIZ_STEPS.flatMap((step) => {
    const chosen = step.options.find((o) => o.value === answers[step.id]);
    return chosen ? [`${step.question} — ${chosen.label}`] : [];
  });
}
