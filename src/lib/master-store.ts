import productsJson from "@/data/products.json";
import settingsJson from "@/data/settings.json";
import type { ProductView } from "./products";
import type { Settings } from "./settings";

const PRODUCTS_KEY = "freya-master-products";
const SETTINGS_KEY = "freya-master-settings";

type ProductRow = ProductView & { sortOrder?: number };

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredProducts(): ProductRow[] {
  return readJson<ProductRow[]>(PRODUCTS_KEY) ?? (productsJson as ProductRow[]);
}

export function saveStoredProducts(products: ProductRow[]) {
  writeJson(PRODUCTS_KEY, products);
}

export function getStoredSettings(): Settings {
  return { ...(settingsJson as Settings), ...(readJson<Partial<Settings>>(SETTINGS_KEY) ?? {}) };
}

export function saveStoredSettings(settings: Settings) {
  writeJson(SETTINGS_KEY, settings);
}

export function getProductById(id: string): ProductRow | undefined {
  return getStoredProducts().find((p) => p.id === id);
}

export function updateProduct(id: string, patch: Partial<ProductRow>) {
  const products = getStoredProducts().map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveStoredProducts(products);
  return products;
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || `product-${Date.now()}`;
}

function uniqueSlug(base: string, products: ProductRow[], ignoreId?: string): string {
  let slug = base;
  for (let i = 2; i < 200; i++) {
    const clash = products.find((p) => p.slug === slug && p.id !== ignoreId);
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export type ProductInput = {
  nameRu: string;
  nameEn: string;
  line: string;
  category: string;
  volume: string;
  price: number;
  oldPrice: number | null;
  description: string;
  usage: string;
  image: string;
  imageBg?: string;
  concerns: string[];
  hairTypes: string[];
  visible: boolean;
  featured: boolean;
};

export type SaveProductResult = { ok: true; id: string; message: string } | { ok: false; message: string };

export function saveProductFromInput(id: string | null, input: ProductInput): SaveProductResult {
  const products = getStoredProducts();

  if (id) {
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) return { ok: false, message: "Товар не найден — возможно, он уже удалён." };
    const existing = products[idx];
    products[idx] = { ...existing, ...input };
    saveStoredProducts(products);
    return { ok: true, id, message: "Изменения сохранены." };
  }

  const newId = crypto.randomUUID();
  const slug = uniqueSlug(slugify(input.nameEn || input.nameRu), products);
  const sortOrder = products.reduce((max, p) => Math.max(max, p.sortOrder ?? 0), 0) + 1;
  const created: ProductRow = { id: newId, slug, sortOrder, ...input };
  saveStoredProducts([...products, created]);
  return { ok: true, id: newId, message: "Товар добавлен." };
}

export function removeProduct(id: string) {
  saveStoredProducts(getStoredProducts().filter((p) => p.id !== id));
}

export function exportMasterData() {
  const products = getStoredProducts();
  const settings = getStoredSettings();
  return { products, settings };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetMasterData() {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
