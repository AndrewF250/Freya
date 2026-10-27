/** Мутации словаря каталога в кабинете мастера (localStorage). */

import {
  catalogFrom,
  uniqueCatalogKey,
  type CatalogEntry,
  type ResolvedCatalog,
} from "./catalog";
import { getStoredProducts, getStoredSettings, saveStoredProducts, saveStoredSettings } from "./master-store";

export function readCatalog(): ResolvedCatalog {
  return catalogFrom(getStoredSettings());
}

export function persistCatalog(catalog: ResolvedCatalog) {
  const settings = getStoredSettings();
  saveStoredSettings({ ...settings, catalog });
}

export function addCatalogEntry(
  kind: "categories" | "concerns" | "hairTypes",
  label: string,
): { ok: true; entry: CatalogEntry } | { ok: false; message: string } {
  const trimmed = label.trim();
  if (trimmed.length < 2) return { ok: false, message: "Введите название — минимум 2 символа." };
  const catalog = readCatalog();
  const list = catalog[kind];
  if (list.some((e) => e.label.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, message: "Такая запись уже есть." };
  }
  const entry: CatalogEntry = { key: uniqueCatalogKey(trimmed, list), label: trimmed };
  persistCatalog({ ...catalog, [kind]: [...list, entry] });
  return { ok: true, entry };
}

export function removeCatalogEntry(
  kind: "categories" | "concerns" | "hairTypes",
  key: string,
): { ok: true } | { ok: false; message: string } {
  const catalog = readCatalog();
  const list = catalog[kind];
  if (!list.some((e) => e.key === key)) return { ok: false, message: "Ярлык уже удалён." };

  if (kind === "categories") {
    if (list.length <= 1) return { ok: false, message: "Нужен хотя бы один тип продукта." };
    const fallback = list.find((e) => e.key !== key && e.key === "other") ?? list.find((e) => e.key !== key);
    if (!fallback) return { ok: false, message: "Нужен хотя бы один тип продукта." };
    saveStoredProducts(getStoredProducts().map((p) => (p.category === key ? { ...p, category: fallback.key } : p)));
  } else {
    const field = kind === "concerns" ? "concerns" : "hairTypes";
    saveStoredProducts(
      getStoredProducts().map((p) => ({ ...p, [field]: p[field].filter((item) => item !== key) })),
    );
  }

  persistCatalog({ ...catalog, [kind]: list.filter((e) => e.key !== key) });
  return { ok: true };
}

export function addCatalogLine(label: string): { ok: true; line: string } | { ok: false; message: string } {
  const trimmed = label.trim();
  if (trimmed.length < 2) return { ok: false, message: "Введите название линейки." };
  const catalog = readCatalog();
  if (catalog.lines.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, message: "Такая линейка уже есть." };
  }
  persistCatalog({ ...catalog, lines: [...catalog.lines, trimmed] });
  return { ok: true, line: trimmed };
}

export function removeCatalogLine(line: string): { ok: true } | { ok: false; message: string } {
  const catalog = readCatalog();
  if (catalog.lines.length <= 1) return { ok: false, message: "Нужна хотя бы одна линейка." };
  const fallback = catalog.lines.find((l) => l !== line) ?? "Davines";
  saveStoredProducts(getStoredProducts().map((p) => (p.line === line ? { ...p, line: fallback } : p)));
  persistCatalog({ ...catalog, lines: catalog.lines.filter((l) => l !== line) });
  return { ok: true };
}
