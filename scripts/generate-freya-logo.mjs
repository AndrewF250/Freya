/**
 * Генерирует freya-logo.svg из Jost Medium (прозрачный фон, векторные пути).
 * node scripts/generate-freya-logo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontPath = path.join(root, "scripts", "Jost-Medium.ttf");

if (!fs.existsSync(fontPath)) {
  console.error("Missing scripts/Jost-Medium.ttf — download from Google Fonts.");
  process.exit(1);
}

const font = opentype.loadSync(fontPath);
const text = "FREYA";
const fontSize = 32;
const tracking = fontSize * 0.44;
const baseline = 30;

let x = 0;
const pathData = [];

for (const char of text) {
  const glyph = font.charToGlyph(char);
  const gpath = glyph.getPath(x, baseline, fontSize);
  pathData.push(gpath.toPathData(2));
  x += (glyph.advanceWidth / font.unitsPerEm) * fontSize + tracking;
}

const width = Math.ceil(x);
const height = 36;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor" role="img" aria-label="FREYA">
  <path d="${pathData.join(" ")}" />
</svg>
`;

const out = path.join(root, "public", "freya-logo.svg");
fs.writeFileSync(out, svg);
console.log(`Wrote ${out} (${width}x${height})`);
