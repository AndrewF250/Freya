import productsJson from "@/data/products.json";
import settingsJson from "@/data/settings.json";
import type { ProductView } from "./products";
import type { Settings } from "./settings";

const PRODUCTS_KEY = "freya-master-products";
const SETTINGS_KEY = "freya-master-settings";

type ProductRow = ProductView & { sortOrder?: number };

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

export function updateProduct(id: string, patch: Partial<ProductRow>) {
  const products = getStoredProducts().map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveStoredProducts(products);
  return products;
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
