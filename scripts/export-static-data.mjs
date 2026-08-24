/**
 * Экспорт данных из SQLite в JSON для статической сборки GitHub Pages.
 * Запуск: node scripts/export-static-data.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const { PrismaClient } = require(join(root, "src", "generated", "prisma"));

const SETTING_DEFAULTS = {
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
  heroText: "Профессиональный уход за волосами и кожей головы.",
  aboutText: "",
  deliveryText: "",
};

const db = new PrismaClient();

try {
  const products = await db.product.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { nameRu: "asc" }],
    select: {
      id: true,
      slug: true,
      nameRu: true,
      nameEn: true,
      line: true,
      category: true,
      volume: true,
      price: true,
      oldPrice: true,
      description: true,
      usage: true,
      image: true,
      concerns: true,
      hairTypes: true,
      visible: true,
      featured: true,
      sortOrder: true,
    },
  });

  const settingsRows = await db.setting.findMany();
  const settingsMap = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));
  const settings = Object.fromEntries(
    Object.keys(SETTING_DEFAULTS).map((k) => [k, settingsMap[k] ?? SETTING_DEFAULTS[k]]),
  );

  const dataDir = join(root, "src", "data");
  mkdirSync(dataDir, { recursive: true });

  const normalized = products.map((p) => ({
    ...p,
    concerns: JSON.parse(p.concerns || "[]"),
    hairTypes: JSON.parse(p.hairTypes || "[]"),
  }));

  writeFileSync(join(dataDir, "products.json"), JSON.stringify(normalized, null, 2), "utf8");
  writeFileSync(join(dataDir, "settings.json"), JSON.stringify(settings, null, 2), "utf8");

  console.log(`Exported ${normalized.length} products and ${Object.keys(settings).length} settings.`);
} finally {
  await db.$disconnect();
}
