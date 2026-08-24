/**
 * Проставляет imageBg в products.json по углам фото.
 * node scripts/sample-product-bgs.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const productsPath = join(root, "src", "data", "products.json");
const products = JSON.parse(readFileSync(productsPath, "utf8"));

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

async function sampleBg(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  const pad = Math.max(2, Math.floor(Math.min(w, h) * 0.02));
  const points = [
    [pad, pad],
    [w - pad - 1, pad],
    [pad, h - pad - 1],
    [w - pad - 1, h - pad - 1],
    [Math.floor(w / 2), pad],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of points) {
    const i = (y * w + x) * ch;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return rgbToHex(r / points.length, g / points.length, b / points.length);
}

let updated = 0;
for (const p of products) {
  if (!p.image?.startsWith("/products/")) continue;
  const file = join(root, "public", p.image.replace(/^\//, ""));
  if (!existsSync(file)) continue;
  try {
    p.imageBg = await sampleBg(file);
    updated++;
  } catch {
    /* skip */
  }
}

writeFileSync(productsPath, `${JSON.stringify(products, null, 2)}\n`);
console.log(`Updated imageBg for ${updated} products.`);
