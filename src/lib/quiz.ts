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
  /** Продукты, которые мастер вручную отметил как точно подходящие к этому ответу (slug). */
  products?: string[];
};

export type QuizStep = {
  id: string;
  question: string;
  caption: string;
  options: QuizOption[];
};

/*
 * Ключи задач и типов волос — из словаря davines.ru (src/data/catalog.json).
 * В lines можно указывать и линию (OI, NaturalTech), и серию (MOMO, LOVE Curl).
 */
export const DEFAULT_QUIZ_STEPS: QuizStep[] = [
  {
    id: "hair",
    question: "Какие у вас волосы?",
    caption: "Отталкиваемся от того, как они ведут себя через день после мытья.",
    options: [
      {
        value: "dry",
        label: "Сухие и жёсткие",
        hint: "Плохо расчёсываются, электризуются",
        concerns: { uvlazhneniya: 3, "pitaniya-i-vosstanovleniya": 1, bleska: 1 },
        hairTypes: { suhie: 3, obezvozhennye: 3, zhestkih: 2 },
        lines: { MOMO: 3, NOUNOU: 1 },
      },
      {
        value: "damaged",
        label: "Повреждённые",
        hint: "Секутся, ломаются по длине",
        concerns: { "pitaniya-i-vosstanovleniya": 3, "zaschity-ot-lomkosti": 2 },
        hairTypes: { povrezhdennyh: 3 },
        lines: { NOUNOU: 3, MELU: 2 },
      },
      {
        value: "thin",
        label: "Тонкие, без объёма",
        hint: "Быстро теряют форму",
        concerns: { plotnosti: 3, "nevesomyi-effekt": 1, tekstury: 1 },
        hairTypes: { tonkie: 3 },
        lines: { VOLU: 3, Replumping: 2, "Liquid Spell": 1 },
      },
      {
        value: "curly",
        label: "Кудрявые или волнистые",
        hint: "Есть завиток, но он путается",
        concerns: { "usileniya-zavitka": 3, "sozdaniya-lokonov": 2, discipliny: 1 },
        hairTypes: { "vyuschihsya-kudryavyh": 3, neposlushnye: 1 },
        lines: { "LOVE Curl": 3 },
      },
      {
        value: "normal",
        label: "В целом нормальные",
        hint: "Хочется просто поддержать состояние",
        concerns: { bleska: 2, "chastogo-mytya": 1, "delikatnogo-ochischeniya": 1 },
        hairTypes: { "vse-tipy": 3 },
        lines: { OI: 2, DEDE: 2 },
      },
    ],
  },
  {
    id: "scalp",
    question: "Какое состояние кожи головы вам ближе?",
    caption: "От этого зависит выбор шампуня — база любого ухода.",
    options: [
      {
        value: "normal",
        label: "Нормальная",
        hint: "Без дискомфорта",
        concerns: { "delikatnogo-ochischeniya": 1 },
        hairTypes: { "vse-tipy": 1 },
        lines: { DEDE: 1 },
      },
      {
        value: "oily",
        label: "Жирная",
        hint: "Корни сальнятся к концу дня",
        concerns: { "protiv-zhirnosti": 3, "glubokogo-ochischeniya": 1 },
        lines: { Rebalancing: 3, SOLU: 2 },
      },
      {
        value: "dry",
        label: "Сухая",
        hint: "Стянутость, шелушение",
        concerns: { uvlazhneniya: 2, "delikatnogo-ochischeniya": 1 },
        lines: { "Well-Being": 2, Calming: 1 },
      },
      {
        value: "sensitive",
        label: "Чувствительная",
        hint: "Зуд, покраснение",
        concerns: { "protiv-chuvstvitelnosti": 3, "delikatnogo-ochischeniya": 1 },
        lines: { Calming: 3 },
      },
      { value: "unknown", label: "Не знаю", hint: "Уточним на консультации в салоне" },
    ],
  },
  {
    id: "goal",
    question: "Что для вас сейчас важнее всего?",
    caption: "Один главный запрос — на нём и построим подбор.",
    options: [
      { value: "dryness", label: "Увлажнение", concerns: { uvlazhneniya: 4 }, lines: { MOMO: 3 } },
      {
        value: "damage",
        label: "Восстановление",
        concerns: { "pitaniya-i-vosstanovleniya": 4, "zaschity-ot-lomkosti": 2, ukrepleniya: 1 },
        lines: { NOUNOU: 3, Nourishing: 2, MELU: 1 },
      },
      { value: "volume", label: "Объём", concerns: { plotnosti: 4, tekstury: 1 }, lines: { VOLU: 3 } },
      {
        value: "frizz",
        label: "Гладкость и дисциплина",
        concerns: { discipliny: 3, gladkosti: 3, "glyancevoi-gladkosti": 2, termozaschity: 1 },
        lines: { "LOVE Smoothing": 3 },
      },
      {
        value: "color",
        label: "Сохранить цвет",
        concerns: { "sohraneniya-cveta": 4 },
        lines: { MINU: 3, Alchemic: 2 },
      },
      {
        value: "shine",
        label: "Блеск и мягкость",
        concerns: { bleska: 4, "glyancevyi-effekt": 2, "glyancevoi-gladkosti": 1 },
        lines: { OI: 3 },
      },
      {
        value: "scalp",
        label: "Здоровье кожи головы",
        concerns: {
          "protiv-vypadeniya": 2,
          "protiv-perhoti": 2,
          "protiv-zhirnosti": 2,
          "protiv-chuvstvitelnosti": 2,
          ukrepleniya: 1,
        },
        lines: { NaturalTech: 3 },
      },
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
        concerns: { "sohraneniya-cveta": 3 },
        hairTypes: { okrashennyh: 3 },
        lines: { MINU: 3 },
      },
      {
        value: "blonde",
        label: "Блонд или осветление",
        concerns: { "sohraneniya-cveta": 2, "zaschity-ot-lomkosti": 2 },
        hairTypes: { osvetlennyh: 3, obescvechennye: 3 },
        lines: { "Heart of glass": 4, Alchemic: 1 },
      },
      {
        value: "tone",
        label: "Хочу поддерживать оттенок",
        concerns: { "pridaniya-cveta": 3 },
        hairTypes: { okrashennyh: 2 },
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
  series?: string[];
  category: string;
  volume: string;
  price: number;
  image: string;
  imageBg?: string;
  concerns: string[];
  hairTypes: string[];
  variants?: { volume: string; slug: string }[];
  related?: string[];
};

/** Порядок, в котором собираем подбор: сначала база, потом длина, потом финиш. */
const SLOT_ORDER: string[][] = [
  ["shampoo"],
  ["mask", "conditioner"],
  ["leaveIn"],
  ["styling", "leaveIn", "conditioner", "mask"],
];

/** В подбор берём только полноразмерный уход за волосами — без наборов, мини и средств для тела. */
const QUIZ_CATEGORIES = new Set(SLOT_ORDER.flat());

/**
 * Подсказки из свободного комментария клиента: «секутся кончики», «пушатся», «жирнеют корни»…
 * Работают как дополнительный ответ анкеты с небольшим весом.
 */
const COMMENT_HINTS: { re: RegExp; concerns?: Record<string, number>; hairTypes?: Record<string, number> }[] = [
  { re: /сух|ломк|секут|сечен/i, concerns: { "zaschity-ot-lomkosti": 2, uvlazhneniya: 1 }, hairTypes: { povrezhdennyh: 1 } },
  { re: /пуш|электриз|непослуш|одуванч/i, concerns: { discipliny: 2, gladkosti: 1 }, hairTypes: { neposlushnye: 2 } },
  { re: /жирн|сальн/i, concerns: { "protiv-zhirnosti": 2 } },
  { re: /перхот|шелуш/i, concerns: { "protiv-perhoti": 2 } },
  { re: /выпада|редеют/i, concerns: { "protiv-vypadeniya": 2, ukrepleniya: 1 } },
  { re: /зуд|раздраж|чувствит/i, concerns: { "protiv-chuvstvitelnosti": 2 } },
  { re: /объ[её]м|тонк|плоск/i, concerns: { plotnosti: 2 }, hairTypes: { tonkie: 1 } },
  { re: /кудр|локон|завит|волнист/i, concerns: { "usileniya-zavitka": 2 }, hairTypes: { "vyuschihsya-kudryavyh": 2 } },
  { re: /блонд|осветл|обесцвеч/i, hairTypes: { osvetlennyh: 2, obescvechennye: 1 } },
  { re: /окраш|цвет/i, concerns: { "sohraneniya-cveta": 2 }, hairTypes: { okrashennyh: 1 } },
  { re: /тускл|блеск/i, concerns: { bleska: 2 } },
  { re: /фен|утюж|плойк|термо/i, concerns: { termozaschity: 2 } },
];

/** Ярлыки, которые описывают кожу головы, а не длину. */
const SCALP_TAGS = new Set([
  "protiv-perhoti",
  "protiv-zhirnosti",
  "protiv-chuvstvitelnosti",
  "protiv-vypadeniya",
  "glubokogo-ochischeniya",
  "delikatnogo-ochischeniya",
]);

type Weights = {
  concerns: Map<string, number>;
  hairTypes: Map<string, number>;
  lines: Map<string, number>;
  /**
   * Отличительные ключи каждого ответа (типы волос и линии/серии, а если их нет — эффекты), чтобы
   * набор закрывал все запросы, а не один самый «тяжёлый».
   */
  steps: Set<string>[];
  /** Ключи ответа про кожу головы — по ним выбираем шампунь. */
  scalp: Set<string>;
  /** Продукты, закреплённые мастером за выбранными ответами: slug → сколько ответов его закрепили. */
  pinned: Map<string, number>;
};

function addWeights(target: Map<string, number>, source?: Record<string, number | undefined>) {
  for (const [key, w] of Object.entries(source ?? {})) target.set(key, (target.get(key) ?? 0) + (w ?? 0));
}

/** Сводит ответы (и комментарий) в веса ярлыков: эффектов, типов волос и линий/серий. */
export function answerWeights(answers: QuizAnswers, comment = "", steps: QuizStep[] = DEFAULT_QUIZ_STEPS): Weights {
  const w: Weights = {
    concerns: new Map(),
    hairTypes: new Map(),
    lines: new Map(),
    steps: [],
    scalp: new Set(),
    pinned: new Map(),
  };
  for (const step of steps) {
    const chosen = step.options.find((o) => o.value === answers[step.id]);
    if (!chosen) continue;
    addWeights(w.concerns, chosen.concerns);
    addWeights(w.hairTypes, chosen.hairTypes);
    addWeights(w.lines, chosen.lines);
    for (const slug of chosen.products ?? []) w.pinned.set(slug, (w.pinned.get(slug) ?? 0) + 1);
    const distinctive = [chosen.hairTypes, chosen.lines].flatMap((m) => Object.keys(m ?? {}));
    const keys = new Set(distinctive.length ? distinctive : Object.keys(chosen.concerns ?? {}));
    if (keys.size) w.steps.push(keys);
    if (step.id === "scalp" && chosen.value !== "normal" && chosen.value !== "unknown") {
      for (const k of [chosen.concerns, chosen.lines].flatMap((m) => Object.keys(m ?? {}))) w.scalp.add(k);
    }
  }
  for (const hint of COMMENT_HINTS) {
    if (!hint.re.test(comment)) continue;
    addWeights(w.concerns, hint.concerns);
    addWeights(w.hairTypes, hint.hairTypes);
  }
  return w;
}

export type ScoredProduct = {
  product: ScorableProduct;
  score: number;
  /** Ярлыки продукта, совпавшие с ответами анкеты. */
  matched: string[];
};

function scoreWith(p: ScorableProduct, w: Weights): ScoredProduct {
  let score = 0;
  const matched: string[] = [];
  for (const key of p.concerns) {
    const weight = w.concerns.get(key);
    if (weight) {
      score += weight;
      matched.push(key);
    }
  }
  let hairHit = false;
  for (const key of p.hairTypes) {
    const weight = w.hairTypes.get(key);
    if (weight) {
      score += weight;
      matched.push(key);
      hairHit = true;
    }
  }
  // Универсальный продукт — запасной вариант, если под тип волос нет точного совпадения.
  if (!hairHit && p.hairTypes.includes("vse-tipy")) score += 0.5;
  for (const [line, weight] of w.lines) {
    if (p.line === line || p.series?.includes(line)) score += weight;
  }
  // Тип волос и самые весомые эффекты — первыми: их показываем клиенту как «почему подходит».
  const weightOf = (k: string) => (w.hairTypes.has(k) ? 100 : 0) + (w.hairTypes.get(k) ?? 0) + (w.concerns.get(k) ?? 0);
  matched.sort((a, b) => weightOf(b) - weightOf(a));
  return { product: p, score, matched };
}

export function scoreProduct(
  p: ScorableProduct,
  answers: QuizAnswers,
  comment = "",
  steps: QuizStep[] = DEFAULT_QUIZ_STEPS,
): number {
  return scoreWith(p, answerWeights(answers, comment, steps)).score;
}

export type RitualItem = ScoredProduct & {
  /** true — по ярлыкам нет прямого совпадения, взят ближайший по линии и смыслу продукт. */
  approximate: boolean;
  /** true — мастер вручную закрепил продукт за одним из выбранных ответов. */
  pinned: boolean;
};

/** Бонус закреплённого продукта: перебивает любое совпадение по ярлыкам. */
const PIN_BONUS = 100;

/**
 * Собирает набор ухода: по одному продукту на слот, в порядке шампунь → уход → длина → финиш.
 * Внутри слота побеждает продукт с наибольшим совпадением ярлыков; при близких баллах — тот, что из той же
 * серии или из «Сопутствующих товаров» Davines к уже выбранным. Если точных совпадений нет,
 * берётся ближайший по смыслу продукт и помечается как «близкий вариант».
 */
export function buildRitualDetailed(
  products: ScorableProduct[],
  answers: QuizAnswers,
  comment = "",
  steps: QuizStep[] = DEFAULT_QUIZ_STEPS,
): RitualItem[] {
  const count = Math.max(1, Math.min(8, Number(answers.depth || 3) || 3));
  const weights = answerWeights(answers, comment, steps);
  // Закреплённые мастером продукты попадают в подбор, даже если это набор или мини-формат.
  const pool = products
    .filter((p) => QUIZ_CATEGORIES.has(p.category) || weights.pinned.has(p.slug))
    .map((p) => {
      const scored = scoreWith(p, weights);
      const pins = weights.pinned.get(p.slug) ?? 0;
      return { ...scored, score: scored.score + pins * PIN_BONUS };
    });

  const picked: RitualItem[] = [];
  const taken = new Set<string>();

  // Небольшой бонус за связку с уже выбранным: та же серия или «Сопутствующие товары» Davines.
  // Не суммируется по всем выбранным, чтобы не перебивать совпадение ярлыков (например, блонд).
  const coherence = (p: ScorableProduct) => {
    let bonus = 0;
    for (const { product: q } of picked) {
      let b = 0;
      if (q.series?.length && p.series?.some((s) => q.series?.includes(s))) b = 2;
      else if (q.line === p.line) b = 0.5;
      if (q.related?.includes(p.slug)) b += 1;
      bonus = Math.max(bonus, b);
    }
    return bonus;
  };
  // Шампунь выбираем по коже головы: если она жирная, сухая или чувствительная, её ярлыки и серии
  // перевешивают запросы по длине (их закроют кондиционер и маска).
  const scalpBoost = (item: ScoredProduct, slot: string[]) => {
    if (!slot.includes("shampoo")) return 0;
    const keys = [...item.matched, item.product.line, ...(item.product.series ?? [])];
    const scalpHits = keys.filter((k) => weights.scalp.has(k)).length;
    const tagHits = item.matched.filter((k) => SCALP_TAGS.has(k)).length;
    return scalpHits * 8 + tagHits * 2;
  };
  const keysOf = (p: ScorableProduct, matched: string[]) => new Set([...matched, p.line, ...(p.series ?? [])]);
  const covers = (keys: Set<string>, step: Set<string>) => [...step].some((k) => keys.has(k));
  // Бонус за ответ анкеты, который ещё не закрыт ни одним выбранным продуктом (например, «блонд»).
  const coverage = (item: ScoredProduct) => {
    if (!picked.length) return 0;
    const pickedKeys = picked.map((d) => keysOf(d.product, d.matched));
    const mine = keysOf(item.product, item.matched);
    return weights.steps.filter((step) => !pickedKeys.some((k) => covers(k, step)) && covers(mine, step)).length * 4;
  };
  const take = (item: ScoredProduct) => {
    const pinned = weights.pinned.has(item.product.slug);
    picked.push({ ...item, pinned, approximate: !pinned && item.matched.length === 0 });
    taken.add(item.product.slug);
    // Другие объёмы того же средства в набор не кладём.
    for (const v of item.product.variants ?? []) taken.add(v.slug);
  };
  const best = (filter: (p: ScorableProduct) => boolean, slot: string[] = []) =>
    pool
      .filter(({ product }) => !taken.has(product.slug) && filter(product))
      .map((item) => ({
        item,
        total: item.score + coherence(item.product) + scalpBoost(item, slot) + coverage(item),
      }))
      .sort((a, b) => b.total - a.total || a.item.product.price - b.item.product.price)[0]?.item;

  for (const slot of SLOT_ORDER.slice(0, count)) {
    const hit = best((p) => slot.includes(p.category), slot);
    if (hit) take(hit);
  }
  while (picked.length < count) {
    const hit = best(() => true);
    if (!hit) break;
    take(hit);
  }

  // Закреплённые продукты, которым не нашлось слота (например, два шампуня), заменяют
  // самые слабые автоматические позиции.
  const missing = pool
    .filter(({ product }) => weights.pinned.has(product.slug) && !taken.has(product.slug))
    .sort((a, b) => b.score - a.score);
  for (const item of missing) {
    if (taken.has(item.product.slug)) continue;
    if (picked.length >= count) {
      const weakest = picked
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => !d.pinned)
        .sort((a, b) => a.d.score - b.d.score)[0];
      if (!weakest) break;
      picked.splice(weakest.i, 1);
    }
    take(item);
  }

  // Порядок на экране: шампунь → кондиционер/маска → несмываемый уход → стайлинг → прочее.
  const order = (p: ScorableProduct) => {
    const i = SLOT_ORDER.findIndex((slot) => slot.includes(p.category));
    return i < 0 ? SLOT_ORDER.length : i;
  };
  return picked.slice(0, count).sort((a, b) => order(a.product) - order(b.product));
}

export function buildRitual(
  products: ScorableProduct[],
  answers: QuizAnswers,
  comment = "",
  steps: QuizStep[] = DEFAULT_QUIZ_STEPS,
): ScorableProduct[] {
  return buildRitualDetailed(products, answers, comment, steps).map((i) => i.product);
}

/** Человекочитаемая расшифровка ответов — для письма в Telegram и кабинета. */
export function describeAnswers(
  answers: QuizAnswers,
  comment = "",
  steps: QuizStep[] = DEFAULT_QUIZ_STEPS,
): string[] {
  const lines = steps.flatMap((step) => {
    const chosen = step.options.find((o) => o.value === answers[step.id]);
    return chosen ? [`${step.question} — ${chosen.label}`] : [];
  });
  if (comment.trim()) lines.push(`Комментарий о волосах — ${comment.trim()}`);
  return lines;
}

/** Шаг «сколько продуктов»: значения его вариантов — число продуктов в подборе. */
export const DEPTH_STEP_ID = "depth";

export type QuizConfig = { steps: QuizStep[] };

function cleanWeights(source: unknown): Record<string, number> | undefined {
  if (!source || typeof source !== "object") return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
    const n = Number(v);
    if (k && Number.isFinite(n) && n > 0) out[k] = Math.min(n, 10);
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Анкета из настроек мастера (settings.quiz) с проверкой структуры.
 * Если настроек нет или они повреждены — стандартная анкета.
 */
export function resolveQuizSteps(source?: { quiz?: QuizConfig | null }): QuizStep[] {
  const raw = source?.quiz?.steps;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_QUIZ_STEPS;
  const steps: QuizStep[] = [];
  const ids = new Set<string>();
  for (const step of raw) {
    const id = String(step?.id ?? "").trim();
    const question = String(step?.question ?? "").trim();
    if (!id || !question || ids.has(id) || !Array.isArray(step.options)) continue;
    const values = new Set<string>();
    const options: QuizOption[] = [];
    for (const o of step.options) {
      const value = String(o?.value ?? "").trim();
      const label = String(o?.label ?? "").trim();
      if (!value || !label || values.has(value)) continue;
      values.add(value);
      options.push({
        value,
        label,
        hint: o.hint ? String(o.hint) : undefined,
        concerns: cleanWeights(o.concerns),
        hairTypes: cleanWeights(o.hairTypes),
        lines: cleanWeights(o.lines),
        products: Array.isArray(o.products) ? [...new Set(o.products.map(String).filter(Boolean))] : undefined,
      });
    }
    if (!options.length) continue;
    ids.add(id);
    steps.push({ id, question, caption: String(step.caption ?? ""), options });
  }
  return steps.length ? steps : DEFAULT_QUIZ_STEPS;
}
