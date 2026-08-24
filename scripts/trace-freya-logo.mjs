/**
 * Прозрачный PNG + SVG из референса FREYA.
 * node scripts/trace-freya-logo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ImageTracer from "imagetracerjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(
  root,
  "..",
  ".cursor",
  "projects",
  "c-Users-F-Documents-AI-Freya",
  "assets",
  "c__Users_F_AppData_Roaming_Cursor_User_workspaceStorage_ee6908ac483608661842a090410a0d96_images_image-d6af136a-6786-4f0e-b19c-7eef6f2c588e.png",
);

// Fallback: workspace-relative asset path
const altSource = "C:/Users/F/.cursor/projects/c-Users-F-Documents-AI-Freya/assets/c__Users_F_AppData_Roaming_Cursor_User_workspaceStorage_ee6908ac483608661842a090410a0d96_images_image-d6af136a-6786-4f0e-b19c-7eef6f2c588e.png";
const input = fs.existsSync(source) ? source : altSource;

if (!fs.existsSync(input)) {
  console.error("Source image not found:", input);
  process.exit(1);
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r > 235 && g > 235 && b > 235) data[i + 3] = 0;
}

const pngOut = path.join(root, "public", "freya-logo.png");
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(pngOut);

const imageData = {
  width: info.width,
  height: info.height,
  data: new Uint8ClampedArray(data),
};

const svgRaw = ImageTracer.imagedataToSVG(imageData, {
  ltres: 0.5,
  qtres: 0.5,
  pathomit: 0,
  colorsampling: 0,
  numberofcolors: 2,
  mincolorratio: 0,
  colorquantcycles: 1,
  scale: 1,
  linefilter: true,
  viewbox: true,
  desc: false,
  lcpr: 0,
  qcpr: 0,
});

const svg = svgRaw
  .replace(/fill="#ffffff"/gi, 'fill="none"')
  .replace(/fill="#fefefe"/gi, 'fill="none"')
  .replace(/fill="white"/gi, 'fill="none"')
  .replace(/<svg /, '<svg fill="currentColor" ');

const svgOut = path.join(root, "public", "freya-logo.svg");
fs.writeFileSync(svgOut, svg);

console.log(`Wrote ${pngOut} and ${svgOut}`);
