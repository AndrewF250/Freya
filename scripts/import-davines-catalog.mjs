/**
 * Импорт каталога с официального сайта davines.ru.
 *
 * node scripts/import-davines-catalog.mjs <cache-dir> [--no-images]
 *
 * 1. Обходит https://davines.ru/catalog/ (все страницы) и фильтры (линии, серии, типы волос).
 * 2. Скачивает карточки товаров (HTML кэшируется в <cache-dir>, повторный запуск не ходит в сеть).
 * 3. Разбирает название, описание, эффекты, применение, состав, характеристики, объёмы, цену и галерею.
 * 4. Скачивает фото, сжимает в webp и кладёт в public/products/<slug>/.
 * 5. Полностью перезаписывает src/data/products.json и src/data/catalog.json.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = process.argv[2];
const withImages = !process.argv.includes("--no-images");
if (!cacheDir) {
  console.error("Usage: node scripts/import-davines-catalog.mjs <cache-dir> [--no-images]");
  process.exit(1);
}

const ORIGIN = "https://davines.ru";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(join(cacheDir, "html"), { recursive: true });
mkdirSync(join(cacheDir, "img"), { recursive: true });

async function fetchCached(url, file) {
  const path = join(cacheDir, file);
  if (existsSync(path)) return readFileSync(path);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(path, buf);
      await sleep(250);
      return buf;
    } catch (err) {
      if (attempt === 3) throw new Error(`${url}: ${err.message}`);
      await sleep(1000 * attempt);
    }
  }
}

const htmlName = (url) => `html/${url.replace(ORIGIN, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "index"}.html`;
const getHtml = async (url) => (await fetchCached(url, htmlName(url))).toString("utf8");

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&#8381;/g, "₽")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** HTML → текст с сохранением абзацев. */
function toText(html) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h\d)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  )
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

const oneLine = (s) => toText(s).replace(/\s*\n\s*/g, " ").trim();

function listingLinks(html) {
  return [...html.matchAll(/class="cards__item-title" href="(\/catalog\/[^"]+)"/g)].map((m) => m[1]);
}

const slugOf = (path) => path.split("/").filter(Boolean).pop();

async function crawlListing(base) {
  const first = await getHtml(base);
  const pages = Number(first.match(/'NavPageCount':'(\d+)'/)?.[1] ?? 1);
  const links = listingLinks(first);
  for (let i = 2; i <= pages; i++) links.push(...listingLinks(await getHtml(`${base}?PAGEN_1=${i}`)));
  return { html: first, links };
}

// ---------- 1. Каталог и фильтры ----------
console.log("Обход каталога…");
const { html: catalogHtml, links: catalogLinks } = await crawlListing(`${ORIGIN}/catalog/`);
const productPaths = new Map();
for (const l of catalogLinks) if (!productPaths.has(slugOf(l))) productPaths.set(slugOf(l), l);
console.log(`  товаров в каталоге: ${productPaths.size}`);

const filters = [
  ...catalogHtml.matchAll(/href="\/catalog\/filter\/wp_pa_(line|semejstvo|hairtype)-is-(wp_term_\d+)\/apply\/">\s*<span>([^<]+)<\/span>/g),
].map((m) => ({ kind: m[1], term: m[2], label: decode(m[3]).trim() }));
const uniqFilters = [...new Map(filters.map((f) => [`${f.kind}:${f.term}`, f])).values()];

const seriesBySlug = new Map();
const hairBySlug = new Map();
const lineBySlug = new Map();
const seriesOrder = [];
const hairOrder = [];
const lineOrder = [];
for (const f of uniqFilters) {
  const { links } = await crawlListing(`${ORIGIN}/catalog/filter/wp_pa_${f.kind}-is-${f.term}/apply/`);
  const target = f.kind === "semejstvo" ? seriesBySlug : f.kind === "hairtype" ? hairBySlug : lineBySlug;
  const order = f.kind === "semejstvo" ? seriesOrder : f.kind === "hairtype" ? hairOrder : lineOrder;
  order.push(f.label);
  for (const l of links) {
    const s = slugOf(l);
    if (!target.has(s)) target.set(s, []);
    if (!target.get(s).includes(f.label)) target.get(s).push(f.label);
  }
  console.log(`  ${f.kind}: ${f.label} — ${links.length}`);
}

// ---------- 2. Карточки ----------
const CATEGORY_KEYS = {
  Шампуни: "shampoo",
  Кондиционеры: "conditioner",
  "Маски для волос": "mask",
  "Несмываемые продукты": "leaveIn",
  Стайлинг: "styling",
  "Продукты для тела": "body",
  Наборы: "set",
  "Мини формат": "mini",
};

/**
 * Типы волос. Фильтр на davines.ru отмечает почти каждый товар половиной типов, поэтому
 * берём тип, только если он прямо упомянут в названии, описании или блоке «Подойдёт ли мне».
 * Ключи совпадают с ключами фильтров davines.ru — на них завязан квиз.
 */
const HAIR_TYPES = [
  { key: "vse-tipy", label: "Для всех типов волос", re: /всех тип(ов|ах) волос|любого типа волос/i },
  { key: "suhie", label: "Для сухих волос", re: /(?<!на )сух(их|ие|им)\s[^.]{0,25}волос|сухост/i },
  { key: "obezvozhennye", label: "Для обезвоженных волос", re: /обезвож/i },
  { key: "tonkie", label: "Для тонких волос", re: /тонк(их|ие|им)\s[^.]{0,20}волос|тонкие и|тонких и/i },
  { key: "povrezhdennyh", label: "Для повреждённых волос", re: /поврежд[её]нн|ломк/i },
  { key: "vyuschihsya-kudryavyh", label: "Для вьющихся и кудрявых волос", re: /кудряв|вьющ|локон|завит/i },
  { key: "neposlushnye", label: "Для непослушных волос", re: /непослушн|пушист|одуванч/i },
  { key: "zhestkih", label: "Для жёстких волос", re: /ж[её]стк/i },
  { key: "okrashennyh", label: "Для окрашенных волос", re: /окрашенн/i },
  { key: "osvetlennyh", label: "Для осветлённых волос", re: /осветл[её]нн|блонд/i },
  { key: "obescvechennye", label: "Для обесцвеченных волос", re: /обесцвеч/i },
];

/** На сайте Davines один и тот же эффект встречается в двух формулировках. */
const EFFECT_ALIASES = {
  "zaschita-ot-lomkosti": "zaschity-ot-lomkosti",
  "pitanie-i-vosstanovlenie": "pitaniya-i-vosstanovleniya",
};

const translit = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
const keyOf = (label) =>
  label
    .toLowerCase()
    .replace(/^для\s+/, "")
    .split("")
    .map((c) => translit[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** "OI - для абсолютной красоты" → { name: "OI", tagline: "для абсолютной красоты" } */
function splitLine(full) {
  const [name, ...rest] = full.split(/\s+-\s+/);
  return { name: name.trim(), tagline: rest.join(" - ").trim() };
}

/** Разделяет "OI/Absolute shampoo - Шампунь для … 280ml" на английскую и русскую части. */
const hasCyr = (s) => /[а-яё]/i.test(s.replace(/(\d\s*)?(мл|гр)\.?/gi, ""));

function splitName(title) {
  const parts = title.split(/\s+[-–]\s+|\s*[-–]\s+(?=[А-ЯЁ])|\s+[-–]\s*(?=[А-ЯЁ])|(?<=[a-z])-(?=[А-ЯЁ])/);
  if (parts.length >= 2) {
    const en = parts[0].trim();
    const ru = parts.slice(1).join(" - ").trim();
    if (/[a-z]/i.test(en) && !hasCyr(en) && hasCyr(ru)) return { nameEn: en, nameRu: capitalize(ru) };
  }
  // "OI/ Рефил шампуня … 500мл-OI Shampoo refill 500ml"
  const inv = title.match(/^(.*[а-яёА-ЯЁ].*?)\s*[-–]\s*([A-Z][^а-яёА-ЯЁ]+)$/);
  if (inv) return { nameEn: inv[2].trim(), nameRu: inv[1].trim() };
  // "OI/Oil, absolute beautifying potion 135 мл" — кириллица только в единицах
  if (!hasCyr(title)) return { nameEn: title, nameRu: title };
  // "SU/ aftersun hair & body wash Увлажняющий шампунь…"
  const glued = title.match(/^([^а-яёА-ЯЁ]*[a-zA-Z]{3}[^а-яёА-ЯЁ]*?)\s+([А-ЯЁ].*)$/);
  if (glued) return { nameEn: glued[1].trim(), nameRu: glued[2].trim() };
  return { nameEn: "", nameRu: title };
}

const section = (html, title) => {
  const re = new RegExp(
    `product-detail-accordion__title">${title}</span>[\\s\\S]*?product-detail-accordion__body">([\\s\\S]*?)</div>\\s*</div>\\s*</div>\\s*</div>`,
  );
  const m = html.match(re);
  return m ? m[1] : "";
};

const effectsDict = new Map();
const products = [];
let index = 0;
console.log("Карточки товаров…");
for (const [davinesSlug, path] of productPaths) {
  let html;
  try {
    html = await getHtml(`${ORIGIN}${path}`);
  } catch (err) {
    console.warn(`  пропуск: ${err.message}`);
    continue;
  }
  const body = html.slice(html.indexOf('class="product__content-body"'));
  const title = decode(html.match(/<h1 class="product__content-title">([\s\S]*?)<\/h1>/)?.[1] ?? "").trim();
  if (!title) {
    console.warn(`  пропуск ${path}: нет заголовка`);
    continue;
  }
  const { nameEn, nameRu } = splitName(title);
  const lineBlock = decode(body.match(/^[^>]*>\s*Линия\s+([^<]+?)\s*<h1/)?.[1] ?? "").trim();
  const [lineFull, pageSeries] = lineBlock.split(/Семейство\s*/).map((s) => s?.trim());
  const sku = body.match(/Артикул\s+(\d+)/)?.[1] ?? "";
  const description = toText(body.match(/<div class="product__content-description">([\s\S]*?)<\/div>/)?.[1] ?? "");

  const effects = [...body.matchAll(/<li class="info-good__item">[\s\S]*?<span>([^<]+)<\/span>/g)].map((m) =>
    decode(m[1]).trim(),
  );
  const effectKey = (e) => EFFECT_ALIASES[keyOf(e)] ?? keyOf(e);
  for (const e of effects) if (!EFFECT_ALIASES[keyOf(e)]) effectsDict.set(keyOf(e), capitalize(e));

  const priceRow = body.match(/data-entity="price-final">([^<]+)</)?.[1] ?? "";
  const price = Number(decode(priceRow).replace(/[^\d]/g, "")) || 0;
  const oldRaw = body.match(/data-entity="price-old"\s+style="([^"]*)">\s*([^<]+)</);
  const oldPrice = oldRaw && !/display:\s*none/.test(oldRaw[1]) ? Number(decode(oldRaw[2]).replace(/[^\d]/g, "")) || null : null;

  const categoryRu = decode(body.match(/<div class="product__content-category">\s*<span>([^<]+)<\/span>/)?.[1] ?? "").trim();
  const category = CATEGORY_KEYS[categoryRu] ?? "other";

  const specs = [...section(html, "Характеристики").matchAll(
    /product-detail-specs__name">([^<]+)<\/div>\s*<div class="product-detail-specs__value">([\s\S]*?)<\/div>/g,
  )].map((m) => ({ name: decode(m[1]).trim(), value: oneLine(m[2]) }));
  const volume = specs.find((s) => s.name === "Объем")?.value ?? "";
  const specLine = specs.find((s) => s.name === "Линия")?.value ?? "";
  const { name: line, tagline: lineTagline } = splitLine(lineFull || specLine || lineBySlug.get(davinesSlug)?.[0] || "Davines");

  const volumesBlock = body.match(/<div class="product-detail-volumes__list">([\s\S]*?)<\/div>/)?.[1] ?? "";
  const variants = [...volumesBlock.matchAll(/<(a|span)([^>]*)>([^<]+)<\/\1>/g)].map((m) => {
    const href = m[2].match(/href="([^"]+)"/)?.[1];
    return {
      volume: decode(m[3]).replace(/\s*(ml|g)$/i, "").trim(),
      davinesSlug: href ? slugOf(href) : davinesSlug,
    };
  });

  const gallery = [
    ...new Set(
      [...html.slice(0, html.indexOf('class="product__content-body"')).matchAll(/class="product__gallery-media" src="([^"]+)"/g)].map(
        (m) => m[1],
      ),
    ),
  ];

  // «Сопутствующие товары» — подборка Davines под карточкой.
  const relStart = html.indexOf("<span>Сопутствующие товары</span>");
  const relEnd = relStart < 0 ? -1 : html.indexOf('class="swiper_block', relStart);
  const relatedDavines =
    relStart < 0
      ? []
      : [...new Set(listingLinks(html.slice(relStart, relEnd < 0 ? undefined : relEnd)).map(slugOf))].filter(
          (s) => s !== davinesSlug,
        );

  let slug = davinesSlug.replace(/_/g, "-").replace(/-+/g, "-").slice(0, 90).replace(/-$/, "");
  if (products.some((p) => p.slug === slug)) slug = `${slug.slice(0, 80)}-${sku}`;
  products.push({
    id: `dv-${sku || slug}`,
    slug,
    nameRu,
    nameEn,
    line,
    lineTagline,
    series: [...new Set([...(seriesBySlug.get(davinesSlug) ?? []), ...(pageSeries ? [pageSeries] : [])])],
    category,
    volume,
    price,
    oldPrice,
    sku,
    description,
    suitability: toText(section(html, "Подойдет ли мне")),
    keyIngredient: toText(section(html, "Ключевой ингредиент")),
    pairing: toText(section(html, "С чем сочетать")),
    usage: toText(section(html, "Применение")),
    composition: oneLine(section(html, "Состав")),
    specs,
    variants,
    related: relatedDavines,
    image: "",
    gallery,
    concerns: [...new Set(effects.map(effectKey))],
    hairTypes: (() => {
      const text = [nameRu, description, toText(section(html, "Подойдет ли мне"))].join(" ");
      return HAIR_TYPES.filter((h) => h.re.test(text)).map((h) => h.key);
    })(),
    visible: true,
    featured: false,
    sortOrder: index++,
    sourceUrl: `${ORIGIN}${path}`,
    _davinesSlug: davinesSlug,
  });
}

// Варианты объёма → наши slug'и
const slugByDavines = new Map(products.map((p) => [p._davinesSlug, p.slug]));
for (const p of products) {
  p.variants = p.variants
    .map((v) => ({ volume: v.volume, slug: slugByDavines.get(v.davinesSlug) ?? "" }))
    .filter((v) => v.slug);
  if (p.variants.length < 2) p.variants = [];
  p.related = p.related.map((s) => slugByDavines.get(s)).filter(Boolean);
}

// ---------- 3. Фото ----------
const productsDir = join(root, "public", "products");
if (withImages) {
  console.log("Фото…");
  rmSync(productsDir, { recursive: true, force: true });
  mkdirSync(productsDir, { recursive: true });
  for (const p of products) {
    const local = [];
    for (const [i, src] of p.gallery.entries()) {
      const url = src.startsWith("http") ? src : `${ORIGIN}${src}`;
      const ext = src.split(".").pop().split("?")[0];
      try {
        const buf = await fetchCached(url, `img/${src.replace(/[^a-z0-9.]+/gi, "_")}`);
        const dir = join(productsDir, p.slug);
        mkdirSync(dir, { recursive: true });
        const file = `${i + 1}.webp`;
        await sharp(buf, { animated: ext === "gif" })
          .rotate()
          .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
          .flatten({ background: "#ffffff" })
          .webp({ quality: 80 })
          .toFile(join(dir, file));
        local.push(`/products/${p.slug}/${file}`);
      } catch (err) {
        console.warn(`  ${p.slug}: ${err.message}`);
      }
    }
    p.gallery = local;
    p.image = local[0] ?? "";
  }
} else {
  for (const p of products) {
    const dir = join(productsDir, p.slug);
    p.gallery = existsSync(dir)
      ? readdirSync(dir)
          .filter((f) => f.endsWith(".webp"))
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((f) => `/products/${p.slug}/${f}`)
      : [];
    p.image = p.gallery[0] ?? "";
  }
}

// Фон под packshot — средний цвет по углам первого фото.
async function sampleBg(file) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const pad = Math.max(2, Math.floor(Math.min(w, h) * 0.02));
  const pts = [[pad, pad], [w - pad - 1, pad], [pad, h - pad - 1], [w - pad - 1, h - pad - 1], [Math.floor(w / 2), pad]];
  const sum = [0, 0, 0];
  for (const [x, y] of pts) for (let c = 0; c < 3; c++) sum[c] += data[(y * w + x) * ch + c];
  return `#${sum.map((v) => Math.round(v / pts.length).toString(16).padStart(2, "0")).join("")}`;
}
for (const p of products) {
  if (p.image) p.imageBg = await sampleBg(join(root, "public", p.image));
  delete p._davinesSlug;
}

// ---------- 4. Запись ----------
const used = (key) => products.some((p) => p.concerns.includes(key));
const catalog = {
  source: `${ORIGIN}/catalog/`,
  importedAt: new Date().toISOString().slice(0, 10),
  categories: [
    ...Object.entries(CATEGORY_KEYS).map(([label, key]) => ({ key, label })),
    { key: "other", label: "Другое" },
  ].filter((c) => products.some((p) => p.category === c.key)),
  concerns: [...effectsDict.entries()].filter(([k]) => used(k)).map(([key, label]) => ({ key, label })),
  hairTypes: HAIR_TYPES.map(({ key, label }) => ({ key, label })).filter((h) =>
    products.some((p) => p.hairTypes.includes(h.key)),
  ),
  lines: lineOrder.map((full) => ({ ...splitLine(full) })),
  series: seriesOrder,
};

writeFileSync(join(root, "src", "data", "products.json"), `${JSON.stringify(products, null, 2)}\n`, "utf8");
writeFileSync(join(root, "src", "data", "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Готово: ${products.length} товаров, ${products.reduce((n, p) => n + p.gallery.length, 0)} фото.`);
