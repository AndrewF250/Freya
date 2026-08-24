export const DEFAULT_IMAGE_BG = "#ffffff";

export function normalizeHex(color: string): string {
  const c = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(c)) {
    const r = c[1];
    const g = c[2];
    const b = c[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return DEFAULT_IMAGE_BG;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось загрузить изображение."));
    img.src = src;
  });
}

function samplePixels(ctx: CanvasRenderingContext2D, points: [number, number][]): string {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of points) {
    const [pr, pg, pb] = ctx.getImageData(x, y, 1, 1).data;
    r += pr;
    g += pg;
    b += pb;
  }
  return rgbToHex(r / points.length, g / points.length, b / points.length);
}

/** Берёт средний цвет по углам и верхнему центру — обычно это фон packshot. */
export async function sampleImageBackground(src: string): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return DEFAULT_IMAGE_BG;
  ctx.drawImage(img, 0, 0);
  const pad = Math.max(2, Math.floor(Math.min(w, h) * 0.02));
  return samplePixels(ctx, [
    [pad, pad],
    [w - pad - 1, pad],
    [pad, h - pad - 1],
    [w - pad - 1, h - pad - 1],
    [Math.floor(w / 2), pad],
  ]);
}

/** Цвет пикселя по клику на превью (координаты относительно элемента). */
export function pickColorAtPoint(
  img: HTMLImageElement,
  clientX: number,
  clientY: number,
  rect: DOMRect,
): string {
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return DEFAULT_IMAGE_BG;

  ctx.drawImage(img, 0, 0);
  const x = Math.max(0, Math.min(w - 1, Math.round(((clientX - rect.left) / rect.width) * w)));
  const y = Math.max(0, Math.min(h - 1, Math.round(((clientY - rect.top) / rect.height) * h)));
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
  return rgbToHex(r, g, b);
}

export function productImageBg(imageBg?: string | null): string {
  return imageBg ? normalizeHex(imageBg) : DEFAULT_IMAGE_BG;
}

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

export async function openSystemEyedropper(): Promise<string | null> {
  if (typeof window === "undefined" || !window.EyeDropper) return null;
  const result = await new window.EyeDropper().open();
  return normalizeHex(result.sRGBHex);
}
