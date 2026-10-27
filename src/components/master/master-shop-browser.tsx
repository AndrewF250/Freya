"use client";

import { useMemo, useState } from "react";
import { Empty } from "@/components/ui";
import { catalogFrom } from "@/lib/catalog";
import { compareByPopularity, type ProductView } from "@/lib/products";
import { plural } from "@/lib/format";
import {
  addCatalogEntry,
  addCatalogLine,
  readCatalog,
  removeCatalogEntry,
  removeCatalogLine,
} from "@/lib/master-catalog";
import { getStoredProducts, getStoredSettings } from "@/lib/master-store";
import { AddChip, FilterChip } from "./add-chip";
import { MasterProductCard } from "./master-product-card";

type Sort = "popularity" | "price-asc" | "price-desc";

export function MasterShopBrowser({ onChange }: { onChange?: () => void }) {
  const [products, setProducts] = useState<ProductView[]>(() => getStoredProducts());
  const [catalog, setCatalog] = useState(() => catalogFrom(getStoredSettings()));
  const [line, setLine] = useState("");
  const [category, setCategory] = useState("");
  const [concern, setConcern] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popularity");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [only, setOnly] = useState<"all" | "hidden" | "featured">("all");
  const [notice, setNotice] = useState("");

  function refresh() {
    setProducts(getStoredProducts());
    setCatalog(readCatalog());
    onChange?.();
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [products]);
  const concernCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      for (const c of p.concerns) map.set(c, (map.get(c) ?? 0) + 1);
    }
    return map;
  }, [products]);
  const lineCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.line, (map.get(p.line) ?? 0) + 1);
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (line && p.line !== line) return false;
      if (category && p.category !== category) return false;
      if (concern && !p.concerns.includes(concern)) return false;
      if (only === "hidden" && p.visible) return false;
      if (only === "featured" && !p.featured) return false;
      if (q && !`${p.nameRu} ${p.nameEn} ${p.line}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return [...list].sort(compareByPopularity);
  }, [products, line, category, concern, query, sort, only]);

  const active = Boolean(line || category || concern || query || only !== "all");
  const reset = () => {
    setLine("");
    setCategory("");
    setConcern("");
    setQuery("");
    setOnly("all");
  };

  return (
    <div>
      <button
        type="button"
        className="btn btn-soft btn-sm mb-4 w-full lg:hidden"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
      >
        {filtersOpen ? "Скрыть фильтры" : `Фильтры${active ? " · активны" : ""}`}
      </button>

      {notice && (
        <p className="mb-4 rounded-lg border border-line bg-sand px-4 py-3 text-[13px]">{notice}</p>
      )}

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr] xl:gap-16">
        <aside className={`lg:sticky lg:top-[88px] lg:self-start ${filtersOpen ? "block" : "hidden lg:block"}`}>
          <label className="block">
            <span className="field-label">Поиск</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MoMo, маска, объём…"
              className="field"
            />
          </label>

          <label className="mt-5 block">
            <span className="field-label">Показать</span>
            <select value={only} onChange={(e) => setOnly(e.target.value as typeof only)} className="field">
              <option value="all">Все товары</option>
              <option value="hidden">Только скрытые</option>
              <option value="featured">Только выбор Кристины</option>
            </select>
          </label>

          <FilterGroup title="Тип продукта">
            {catalog.categories.map((c) => (
              <FilterChip
                key={c.key}
                label={c.label}
                count={categoryCounts.get(c.key) ?? 0}
                active={category === c.key}
                onSelect={() => setCategory(category === c.key ? "" : c.key)}
                onRemove={() => {
                  const result = removeCatalogEntry("categories", c.key);
                  if (!result.ok) flash(result.message);
                  else {
                    if (category === c.key) setCategory("");
                    refresh();
                  }
                }}
              />
            ))}
            <AddChip
              placeholder="Новый тип"
              onAdd={(label) => {
                const result = addCatalogEntry("categories", label);
                if (!result.ok) flash(result.message);
                else refresh();
              }}
            />
          </FilterGroup>

          <FilterGroup title="Задача">
            {catalog.concerns.map((c) => (
              <FilterChip
                key={c.key}
                label={c.label}
                count={concernCounts.get(c.key) ?? 0}
                active={concern === c.key}
                onSelect={() => setConcern(concern === c.key ? "" : c.key)}
                onRemove={() => {
                  const result = removeCatalogEntry("concerns", c.key);
                  if (!result.ok) flash(result.message);
                  else {
                    if (concern === c.key) setConcern("");
                    refresh();
                  }
                }}
              />
            ))}
            <AddChip
              placeholder="Новая задача"
              onAdd={(label) => {
                const result = addCatalogEntry("concerns", label);
                if (!result.ok) flash(result.message);
                else refresh();
              }}
            />
          </FilterGroup>

          <FilterGroup title="Линейка">
            {catalog.lines.map((l) => (
              <FilterChip
                key={l}
                label={l}
                count={lineCounts.get(l) ?? 0}
                active={line === l}
                onSelect={() => setLine(line === l ? "" : l)}
                onRemove={() => {
                  const result = removeCatalogLine(l);
                  if (!result.ok) flash(result.message);
                  else {
                    if (line === l) setLine("");
                    refresh();
                  }
                }}
              />
            ))}
            <AddChip
              placeholder="Новая линейка"
              onAdd={(label) => {
                const result = addCatalogLine(label);
                if (!result.ok) flash(result.message);
                else refresh();
              }}
            />
          </FilterGroup>

          {active && (
            <button type="button" onClick={reset} className="btn btn-soft btn-sm mt-7 w-full">
              Сбросить фильтры
            </button>
          )}
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <p className="text-[14px] text-muted">
              {filtered.length} {plural(filtered.length, ["продукт", "продукта", "продуктов"])}
            </p>
            <label className="flex min-w-0 items-center gap-2.5 text-[13px] text-ink-soft">
              Сортировка
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !w-auto !py-2">
                <option value="popularity">По популярности</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <Empty title="Ничего не нашлось" text="Попробуйте убрать часть фильтров или уточнить запрос.">
              <button type="button" onClick={reset} className="btn btn-outline btn-sm">
                Сбросить фильтры
              </button>
            </Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((p) => (
                <MasterProductCard key={p.id} product={p} catalog={catalog} onChange={refresh} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-7">
      <p className="eyebrow mb-3">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
