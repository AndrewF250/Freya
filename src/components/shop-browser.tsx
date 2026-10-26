"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard, type CardProduct } from "./product-card";
import { Empty } from "./ui";
import type { CatalogEntry } from "@/lib/catalog";
import { compareByPopularity } from "@/lib/products";
import { plural } from "@/lib/format";

type Product = CardProduct & { id: string; concerns: string[]; sortOrder?: number };

type Sort = "popularity" | "price-asc" | "price-desc";

export function ShopBrowser({
  products,
  lines,
  categories,
  concerns,
}: {
  products: Product[];
  lines: string[];
  categories: CatalogEntry[];
  concerns: CatalogEntry[];
}) {
  const searchParams = useSearchParams();
  const lineParam = searchParams.get("line") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const [line, setLine] = useState(lineParam);
  const [category, setCategory] = useState(categoryParam);
  const [concern, setConcern] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popularity");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryKeys = useMemo(() => new Set(categories.map((c) => c.key)), [categories]);
  const selectedLine = lines.includes(line) ? line : "";
  const selectedCategory = categoryKeys.has(category) ? category : "";

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

  const categoriesPresent = useMemo(
    () => categories.filter((c) => (categoryCounts.get(c.key) ?? 0) > 0),
    [categories, categoryCounts],
  );
  const concernsPresent = useMemo(
    () => concerns.filter((c) => (concernCounts.get(c.key) ?? 0) > 0),
    [concerns, concernCounts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedLine && p.line !== selectedLine) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (concern && !p.concerns.includes(concern)) return false;
      if (q && !`${p.nameRu} ${p.nameEn} ${p.line}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return [...list].sort(compareByPopularity);
  }, [products, selectedLine, selectedCategory, concern, query, sort]);

  const active = Boolean(selectedLine || selectedCategory || concern || query);
  const reset = () => {
    setLine("");
    setCategory("");
    setConcern("");
    setQuery("");
  };

  return (
    <div className="shell section-tight md:section">
      <button
        type="button"
        className="btn btn-soft btn-sm mb-4 w-full lg:hidden"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
      >
        {filtersOpen ? "Скрыть фильтры" : `Фильтры${active ? " · активны" : ""}`}
      </button>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12 xl:grid-cols-[280px_1fr] xl:gap-16">
        <aside className={`lg:sticky lg:top-[92px] lg:self-start ${filtersOpen ? "block" : "hidden lg:block"}`}>
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

          <FilterGroup title="Тип продукта">
            {categoriesPresent.map((c) => (
              <button
                key={c.key}
                type="button"
                className="chip"
                data-active={selectedCategory === c.key}
                onClick={() => setCategory(selectedCategory === c.key ? "" : c.key)}
              >
                {c.label}
                <span className="text-muted">{categoryCounts.get(c.key) ?? 0}</span>
              </button>
            ))}
          </FilterGroup>

          <FilterGroup title="Задача">
            {concernsPresent.map((c) => (
              <button
                key={c.key}
                type="button"
                className="chip"
                data-active={concern === c.key}
                onClick={() => setConcern(concern === c.key ? "" : c.key)}
              >
                {c.label}
                <span className="text-muted">{concernCounts.get(c.key) ?? 0}</span>
              </button>
            ))}
          </FilterGroup>

          <FilterGroup title="Линейка">
            {lines.map((l) => (
              <button
                key={l}
                type="button"
                className="chip"
                data-active={selectedLine === l}
                onClick={() => setLine(selectedLine === l ? "" : l)}
              >
                {l}
                <span className="text-muted">{lineCounts.get(l) ?? 0}</span>
              </button>
            ))}
          </FilterGroup>

          {active && (
            <button type="button" onClick={reset} className="btn btn-soft btn-sm mt-7 w-full">
              Сбросить фильтры
            </button>
          )}

          <div className="card-flat mt-8 p-4">
            <p className="text-[14px]">Не уверены, что нужно?</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
              Пять вопросов — и мы подберём уход под ваши волосы.
            </p>
            <Link href="/quiz" className="btn btn-primary btn-sm mt-4 w-full">
              Пройти подбор
            </Link>
          </div>
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
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
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
