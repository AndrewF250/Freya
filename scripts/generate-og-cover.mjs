import path from "node:path";
import sharp from "sharp";

const src = path.join(process.cwd(), "public", "photos", "kristina-portrait.webp");
const out = path.join(process.cwd(), "public", "og-cover.jpg");

await sharp(src)
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .jpeg({ quality: 85 })
  .toFile(out);

console.log("✓ og-cover.jpg");
