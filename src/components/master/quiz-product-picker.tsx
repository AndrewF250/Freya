"use client";

import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { catalogLabel, sortLines, type ResolvedCatalog } from "@/lib/catalog";
import { rub } from "@/lib/format";
import type { ProductView } from "@/lib/products";

type PickerProduct = Pick<
  ProductView,
  "slug" | "nameRu" | "nameEn" | "line" | "series" | "category" | "volume" | "price" | "image" | "imageBg" | "visible"
>;

/** Каталог с галочками: мастер отмечает продукты, которые точно подходят к варианту ответа. */
export function QuizProductPicker({
  products,
  catalog,
  selected,
  onChange,
  onClose,
}: {
  products: PickerProduct[];
  catalog: ResolvedCatalog;
  selected: string[];
  onChange: (slugs: string[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [line, setLine] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const lines = useMemo(() => sortLines([...new Set(products.map((p) => p.line))], catalog.lines), [products, catalog.lines]);
  const categories = catalog.categories.filter((c) => products.some((p) => p.category === c.key));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (onlySelected && !selectedSet.has(p.slug)) return false;
      if (category && p.category !== category) return false;
      if (line && p.line !== line) return false;
      if (q && !`${p.nameEn} ${p.nameRu} ${p.line} ${(p.series ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, category, line, onlySelected, selectedSet]);

  function toggle(slug: string) {
    onChange(selectedSet.has(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);
  }

  return (
    <div className="mt-3 rounded-[12px] border border-line bg-sand/60 p-3 sm:p-4">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: OI, MOMO, маска…"
          className="field !py-2"
          aria-label="Поиск по каталогу"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field !w-auto !py-2" aria-label="Тип продукта">
          <option value="">Все типы</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <select value={line} onChange={(e) => setLine(e.target.value)} className="field !w-auto !py-2" aria-label="Линия">
          <option value="">Все линии</option>
          {lines.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={onlySelected}
            onChange={(e) => setOnlySelected(e.target.checked)}
            className="h-4 w-4 accent-[#1b2430]"
          />
          Только выбранные ({selected.length})
        </label>
        <span>Найдено: {filtered.length}</span>
      </div>

      <ul className="mt-3 grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const checked = selectedSet.has(p.slug);
          return (
            <li key={p.slug}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-[10px] border bg-paper p-2 transition-colors ${
                  checked ? "border-navy" : "border-line hover:border-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(p.slug)}
                  className="h-4 w-4 shrink-0 accent-[#1b2430]"
                />
                <ProductImage
                  src={p.image}
                  alt=""
                  sizes="48px"
                  bgColor={p.imageBg}
                  padding="p-1"
                  className="h-12 w-12 shrink-0 rounded-md"
                />
                <span className="min-w-0">
                  <span className="block truncate text-[13px]">{p.nameEn || p.nameRu}</span>
                  <span className="block truncate text-[11px] text-muted">
                    {p.line}
                    {p.series?.[0] ? ` · ${p.series[0]}` : ""} · {catalogLabel(catalog.categories, p.category, "Другое")}
                    {p.volume ? ` · ${p.volume}` : ""} · {rub(p.price)}
                    {p.visible === false ? " · скрыт" : ""}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
        {filtered.length === 0 && <li className="py-6 text-center text-[13px] text-muted sm:col-span-2 lg:col-span-3">Ничего не нашлось</li>}
      </ul>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {selected.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="btn btn-soft btn-sm">
            Снять все
          </button>
        )}
        <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
          Готово
        </button>
      </div>
    </div>
  );
}
