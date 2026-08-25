import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "photos");

const SOURCES = [
  // brand banners (existing)
  {
    url: "https://davines.ru/wp-content/uploads/2026/08/davines_banner_2400h980_20.12-1.jpg",
    file: "davines-brand-wide.webp",
    width: 1920,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/08/davines_banner_1150h1250_20.12-1.jpg",
    file: "davines-brand-tall.webp",
    width: 1200,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2021/05/01-2.14-cover_image_x2000.jpg",
    file: "davines-brand-parma.webp",
    width: 1600,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2025/09/banner.jpg",
    file: "davines-brand-stylist.webp",
    width: 1920,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/07/davines_banner_2400h980_17.07.jpg",
    file: "davines-brand-nature.webp",
    width: 1920,
  },
  // care categories (user + homepage tiles)
  {
    url: "https://davines.ru/wp-content/uploads/2025/12/shampuni-1.jpg",
    file: "davines-care-shampoo.webp",
    width: 1400,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/06/18-scaled.jpg",
    file: "davines-care-conditioner.webp",
    width: 1400,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/06/aab892eb760e1a6d758c5065bd591621ff3609d9.jpg",
    file: "davines-care-styling.webp",
    width: 1400,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/06/waves-look-scaled.jpg",
    file: "davines-care-waves.webp",
    width: 1400,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2025/12/maski.jpg",
    file: "davines-care-mask.webp",
    width: 1400,
  },
  // line heroes (essential + es-hero)
  {
    url: "https://davines.ru/wp-content/uploads/2026/04/es-hero-1-1.png",
    file: "davines-line-hero.webp",
    width: 1600,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2024/03/1-1-scaled.jpg",
    file: "davines-line-essential-1.webp",
    width: 1400,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2024/03/2-1-scaled.jpg",
    file: "davines-line-essential-2.webp",
    width: 1400,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2024/03/3-1-scaled.jpg",
    file: "davines-line-essential-3.webp",
    width: 1400,
  },
];

await fs.mkdir(OUT_DIR, { recursive: true });

for (const { url, file, width } of SOURCES) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = path.join(OUT_DIR, file);
  await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  const meta = await sharp(out).metadata();
  console.log(`✓ ${file} (${meta.width}×${meta.height})`);
}
