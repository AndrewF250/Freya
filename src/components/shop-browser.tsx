"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard, type CardProduct } from "./product-card";
import { Empty } from "./ui";
import { CATEGORIES, CONCERNS, type CategoryKey, type ConcernKey } from "@/lib/catalog";
import { plural } from "@/lib/format";

type Product = CardProduct & { id: string; concerns: string[] };

type Sort = "default" | "price-asc" | "price-desc";

export function ShopBrowser({
  products,
  lines,
}: {
  products: Product[];
  lines: string[];
}) {
  const searchParams = useSearchParams();
  const [line, setLine] = useState("");
  const [category, setCategory] = useState("");
  const [concern, setConcern] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("default");

  useEffect(() => {
    const initialLine = searchParams.get("line") ?? "";
    const initialCategory = searchParams.get("category") ?? "";
    if (initialLine && lines.includes(initialLine)) setLine(initialLine);
    if (initialCategory && initialCategory in CATEGORIES) setCategory(initialCategory);
  }, [searchParams, lines]);

  const categoriesPresent = useMemo(
    () => (Object.keys(CATEGORIES) as CategoryKey[]).filter((c) => products.some((p) => p.category === c)),
    [products],
  );
  const concernsPresent = useMemo(
    () => (Object.keys(CONCERNS) as ConcernKey[]).filter((c) => products.some((p) => p.concerns.includes(c))),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (line && p.line !== line) return false;
      if (category && p.category !== category) return false;
      if (concern && !p.concerns.includes(concern)) return false;
      if (q && !`${p.nameRu} ${p.nameEn} ${p.line}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, line, category, concern, query, sort]);

  const active = Boolean(line || category || concern || query);
  const reset = () => {
    setLine("");
    setCategory("");
    setConcern("");
    setQuery("");
  };

  return (
    <div className="shell section">
      <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* ── Фильтры ────────────────────────────────── */}
        <aside className="lg:sticky lg:top-[92px] lg:self-start">
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
                key={c}
                type="button"
                className="chip"
                data-active={category === c}
                onClick={() => setCategory(category === c ? "" : c)}
              >
                {CATEGORIES[c]}
              </button>
            ))}
          </FilterGroup>

          <FilterGroup title="Задача">
            {concernsPresent.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                data-active={concern === c}
                onClick={() => setConcern(concern === c ? "" : c)}
              >
                {CONCERNS[c]}
              </button>
            ))}
          </FilterGroup>

          <FilterGroup title="Линейка">
            {lines.map((l) => (
              <button
                key={l}
                type="button"
                className="chip"
                data-active={line === l}
                onClick={() => setLine(line === l ? "" : l)}
              >
                {l}
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
              Пять вопросов — и Кристина соберёт ритуал под ваши волосы.
            </p>
            <Link href="/quiz" className="btn btn-primary btn-sm mt-4 w-full">
              Пройти подбор
            </Link>
          </div>
        </aside>

        {/* ── Сетка ──────────────────────────────────── */}
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <p className="text-[14px] text-muted">
              {filtered.length} {plural(filtered.length, ["продукт", "продукта", "продуктов"])}
            </p>
            <label className="flex items-center gap-2.5 text-[13px] text-ink-soft">
              Сортировка
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !w-auto !py-2">
                <option value="default">По умолчанию</option>
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
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
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
