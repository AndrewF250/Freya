/**
 * Наполняет базу каталогом Davines из src/data/products.json
 * (его собирает scripts/import-davines-catalog.mjs с davines.ru).
 *
 * Старые товары, которых больше нет в каталоге, удаляются.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const { PrismaClient } = require(join(here, "..", "src", "generated", "prisma"));

const db = new PrismaClient();
const products = JSON.parse(readFileSync(join(here, "..", "src", "data", "products.json"), "utf8"));

const DEFAULT_SETTINGS = {
  masterName: "Кристина",
  masterTitle: "Амбассадор Davines · парикмахер-стилист",
  salonName: "ФРЕЯ",
  phone: "+7 (999) 123-45-67",
  email: "hello@freya-salon.ru",
  address: "Пермь, Комсомольский проспект, 51А",
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
    "Доставка по Перми — 500 ₽. СДЭК по России — по тарифам перевозчика. Оплата при получении или переводом.",
};

async function main() {
  const slugs = products.map((p) => p.slug);
  const removed = await db.product.deleteMany({ where: { slug: { notIn: slugs } } });

  for (const p of products) {
    const data = {
      slug: p.slug,
      nameRu: p.nameRu,
      nameEn: p.nameEn,
      line: p.line,
      category: p.category,
      volume: p.volume,
      price: p.price,
      oldPrice: p.oldPrice,
      description: p.description,
      usage: p.usage,
      image: p.image,
      concerns: JSON.stringify(p.concerns),
      hairTypes: JSON.stringify(p.hairTypes),
      visible: p.visible,
      featured: p.featured,
      sortOrder: p.sortOrder,
    };
    await db.product.upsert({ where: { slug: p.slug }, update: data, create: data });
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log(`Готово: ${products.length} товаров, удалено старых: ${removed.count}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
