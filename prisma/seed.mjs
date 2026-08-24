/**
 * Наполняет базу каталогом Davines.
 * Запуск: npm run db:seed
 *
 * Скрипт идемпотентен — повторный запуск обновляет существующие товары
 * по slug и не трогает те, что Кристина завела вручную в кабинете.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const { PrismaClient } = require(join(here, "..", "src", "generated", "prisma"));

const db = new PrismaClient();
const products = JSON.parse(readFileSync(join(here, "products-seed.json"), "utf8"));

/** Описание и типы волос по линейке Davines. */
const LINES = {
  MoMo: {
    story:
      "Линейка глубокого увлажнения на экстракте жёлтой дыни сорта Картуччару из Пачеко, выращенной по программе Slow Food. Возвращает сухим волосам мягкость и эластичность.",
    hairTypes: ["dry", "normal"],
  },
  NouNou: {
    story:
      "Интенсивное питание для повреждённых и обесцвеченных волос. В основе — экстракт помидора сорта Фьяскетто из Торре-Каноне: уплотняет структуру и возвращает плотность.",
    hairTypes: ["damaged", "dry", "colored"],
  },
  Love: {
    story:
      "Уход для дисциплины и завитка: экстракт оливы Ночеллара-дель-Беличе разглаживает пушистость, миндаль из Ното подчёркивает форму кудрей.",
    hairTypes: ["curly", "normal"],
  },
  Dede: {
    story:
      "Деликатная база на каждый день. Лёгкие формулы для частого мытья, которые не утяжеляют и подходят любому типу волос.",
    hairTypes: ["normal", "thin"],
  },
  Minu: {
    story:
      "Защита косметического цвета. Экстракт каперсов с Салина сохраняет насыщенность пигмента и продлевает жизнь окрашиванию.",
    hairTypes: ["colored"],
  },
  Melu: {
    story:
      "Для длинных и склонных к ломкости волос. Экстракт риса из Бараджи укрепляет по всей длине и снижает риск сечения.",
    hairTypes: ["damaged", "normal"],
  },
  Volu: {
    story:
      "Лёгкий объём для тонких волос. Экстракт оливы Ночеллара-дель-Беличе придаёт плотность, не склеивая и не утяжеляя.",
    hairTypes: ["thin", "normal"],
  },
  Solu: {
    story: "Глубокое очищение для волос и кожи головы. Морская соль из Черво мягко снимает загрязнения и излишки себума.",
    hairTypes: ["oily", "normal"],
  },
  OI: {
    story:
      "Абсолютная красота волос на масле роукоу из Амазонии. Питает, разглаживает и даёт тот самый зеркальный блеск без утяжеления.",
    hairTypes: ["normal", "dry", "colored"],
  },
  Alchemic: {
    story:
      "Система прямого тонирования: поддерживает и усиливает натуральный или косметический оттенок между окрашиваниями.",
    hairTypes: ["colored"],
  },
  "Heart of Glass": {
    story:
      "Уход для любых светлых волос. Экстракт синего василька нейтрализует желтизну, укрепляет и возвращает блонду прозрачность.",
    hairTypes: ["colored", "damaged"],
  },
  Naturaltech: {
    story:
      "Профессиональная линия для кожи головы: работает с причиной, а не с симптомом. Подбирается после трихологической диагностики.",
    hairTypes: ["oily", "normal", "thin"],
  },
  "More Inside": {
    story: "Стайлинг Davines: текстуры, фиксация и форма с той же этичной философией, что и уход.",
    hairTypes: ["normal", "thin", "curly"],
  },
  "The Circle Chronicles": {
    story: "Сезонные ритуалы Davines — ограниченные серии для конкретной задачи и настроения.",
    hairTypes: ["normal"],
  },
  "Essential Haircare": {
    story: "Базовая линия ежедневного ухода Davines: простые формулы под конкретный тип волос.",
    hairTypes: ["normal"],
  },
  Davines: { story: "Профессиональный уход Davines — итальянская наука и этичный подход к красоте волос.", hairTypes: ["normal"] },
};

/** Как пользоваться — по типу продукта. */
const USAGE = {
  shampoo:
    "Нанесите на влажные волосы, вспеньте массирующими движениями и тщательно смойте. При необходимости повторите.",
  conditioner: "Нанесите на подсушенные полотенцем волосы по длине, отступив от корней. Оставьте на 2–3 минуты и смойте.",
  mask: "Нанесите на вымытые влажные волосы по длине. Оставьте на 5–10 минут, затем тщательно смойте.",
  serum: "Нанесите на влажные или сухие волосы по длине. Не смывать.",
  oil: "Распределите несколько капель по влажным или сухим волосам, уделяя внимание кончикам. Не смывать.",
  scalp: "Нанесите на кожу головы, распределите массирующими движениями. Следуйте инструкции на упаковке.",
  styling: "Нанесите на влажные или сухие волосы в зависимости от желаемой текстуры и уложите привычным способом.",
  other: "Следуйте инструкции на упаковке или уточните способ применения у Кристины.",
};

/**
 * Флагманские шампуни Davines, которых не оказалось у источника фотографий.
 * Заводим их без картинки — в каталоге они рисуются с заглушкой, а Кристина
 * загружает своё фото и ставит цену через кабинет мастера.
 */
const MISSING_FLAGSHIPS = [
  { slug: "momo-shampoo", nameRu: "Шампунь для глубокого увлажнения волос", nameEn: "MoMo Shampoo", line: "MoMo", category: "shampoo", concerns: ["dryness"], volume: "250 мл", price: 3200 },
  { slug: "nounou-shampoo", nameRu: "Питательный шампунь для повреждённых волос", nameEn: "NouNou Shampoo", line: "NouNou", category: "shampoo", concerns: ["damage"], volume: "250 мл", price: 3300 },
  { slug: "love-smoothing-shampoo", nameRu: "Шампунь для разглаживания завитка", nameEn: "Love Smoothing Shampoo", line: "Love", category: "shampoo", concerns: ["frizz"], volume: "250 мл", price: 3200 },
  { slug: "love-curl-shampoo", nameRu: "Шампунь для усиления завитка", nameEn: "Love Curl Shampoo", line: "Love", category: "shampoo", concerns: ["curls"], volume: "250 мл", price: 3200 },
  { slug: "minu-shampoo", nameRu: "Защитный шампунь для окрашенных волос", nameEn: "Minu Shampoo", line: "Minu", category: "shampoo", concerns: ["color"], volume: "250 мл", price: 3300 },
  { slug: "solu-shampoo", nameRu: "Шампунь для глубокого очищения", nameEn: "Solu Shampoo", line: "Solu", category: "shampoo", concerns: ["scalp"], volume: "250 мл", price: 3300 },
  { slug: "heart-of-glass-shampoo", nameRu: "Шампунь для светлых волос", nameEn: "Heart of Glass Silkening Shampoo", line: "Heart of Glass", category: "shampoo", concerns: ["color"], volume: "250 мл", price: 3600 },
  { slug: "oi-shampoo", nameRu: "Шампунь для абсолютной красоты волос", nameEn: "OI Shampoo", line: "OI", category: "shampoo", concerns: ["shine"], volume: "280 мл", price: 3900 },
].map((p) => ({ ...p, image: "", srcImg: "", href: "" }));

/**
 * Товары для блока «Выбор Кристины» на главной.
 * Берём только те, у которых есть фото, и с разбросом по задачам —
 * витрина не должна открываться стеной заглушек.
 */
const FEATURED = [
  "dede-shampoo",
  "volu-shampoo",
  "melu-shampoo",
  "nounou-hair-mask",
  "minu-hair-mask",
  "oi-oil",
  "love-curl-mask",
  "heart-of-glass-instant-bonding-glow",
];

function enrich(p, index) {
  const line = LINES[p.line] ?? LINES.Davines;
  const kindMatch = p.nameRu.match(/^[А-ЯЁA-Z][а-яёa-z-]+/);
  const kind = kindMatch ? kindMatch[0] : "Средство";
  const description = `${kind} линейки ${p.line}. ${line.story}`;

  // Теги задач: то, что вытащили из названия, плюс профиль линейки.
  const concerns = new Set(p.concerns);
  if (p.line === "MoMo") concerns.add("dryness");
  if (p.line === "NouNou") concerns.add("damage");
  if (p.line === "Volu") concerns.add("volume");
  if (p.line === "Minu" || p.line === "Alchemic" || p.line === "Heart of Glass") concerns.add("color");
  if (p.line === "Naturaltech" || p.line === "Solu") concerns.add("scalp");
  if (p.line === "OI") concerns.add("shine");
  if (p.line === "Love") concerns.add(/curl|кудр|завит/i.test(p.nameEn + p.nameRu) ? "curls" : "frizz");
  if (p.line === "Melu") concerns.add("damage");
  if (concerns.size === 0) concerns.add("shine");

  return {
    slug: p.slug,
    nameRu: p.nameRu,
    nameEn: p.nameEn,
    line: p.line,
    category: p.category,
    volume: p.volume,
    price: p.price,
    description,
    usage: USAGE[p.category] ?? USAGE.other,
    image: p.image,
    concerns: JSON.stringify([...concerns]),
    hairTypes: JSON.stringify(line.hairTypes),
    visible: true,
    featured: FEATURED.includes(p.slug),
    sortOrder: index,
  };
}

const DEFAULT_SETTINGS = {
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
  heroText:
    "Профессиональный уход за волосами и кожей головы. Итальянская наука Davines, честная диагностика и подбор, который работает дома, а не только в кресле.",
  aboutText:
    "Я Кристина — парикмахер-стилист и амбассадор Davines. Больше десяти лет работаю с волосами и всё это время убеждаюсь в одном: домашний уход решает больше, чем любая процедура в салоне. Поэтому я не продаю банки — я собираю ритуал под ваши волосы и объясняю, зачем в нём каждый шаг.",
  deliveryText:
    "Самовывоз из студии на Петровке — бесплатно. Доставка по Москве — 500 ₽, по России — по тарифам СДЭК. Оплата при получении или переводом.",
};

async function main() {
  const all = [...products, ...MISSING_FLAGSHIPS];
  console.log(`Загружаю ${all.length} товаров Davines (${MISSING_FLAGSHIPS.length} — без фото, под заглушку)...`);

  let created = 0;
  let updated = 0;
  for (const [i, raw] of all.entries()) {
    const data = enrich(raw, i);
    const existing = await db.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      // Цену и видимость не трогаем — их мог поменять мастер.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- отбрасываем два поля через rest
      const { price, visible, ...rest } = data;
      await db.product.update({ where: { slug: data.slug }, data: rest });
      updated++;
    } else {
      await db.product.create({ data });
      created++;
    }
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  const total = await db.product.count();
  console.log(`Готово: ${created} создано, ${updated} обновлено. Всего в каталоге: ${total}.`);
  console.log(`Настройки студии: ${Object.keys(DEFAULT_SETTINGS).length} записей.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
