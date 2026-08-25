import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "photos");

const SOURCES = [
  {
    url: "https://davines.ru/wp-content/uploads/2025/12/shampuni-1.jpg",
    file: "davines-cat-shampoo.webp",
    width: 900,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/06/18-scaled.jpg",
    file: "davines-cat-conditioner.webp",
    width: 900,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2025/12/maski.jpg",
    file: "davines-cat-mask.webp",
    width: 900,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/06/aab892eb760e1a6d758c5065bd591621ff3609d9.jpg",
    file: "davines-cat-leave-in.webp",
    width: 900,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2026/06/waves-look-scaled.jpg",
    file: "davines-cat-styling.webp",
    width: 900,
  },
  {
    url: "https://davines.ru/wp-content/uploads/2024/01/travels.jpg",
    file: "davines-cat-mini.webp",
    width: 900,
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
