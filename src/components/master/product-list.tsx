"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/catalog";
import { rub, plural } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import { updateProduct } from "@/lib/master-store";

export type ListProduct = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  line: string;
  category: string;
  volume: string;
  price: number;
  image: string;
  visible: boolean;
  featured: boolean;
};

export function MasterProductList({
  products,
  lines,
  onChange,
}: {
  products: ListProduct[];
  lines: string[];
  onChange: () => void;
}) {
  const [query, setQuery] = useState("");
  const [line, setLine] = useState("");
  const [only, setOnly] = useState<"all" | "hidden" | "featured">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (line && p.line !== line) return false;
      if (only === "hidden" && p.visible) return false;
      if (only === "featured" && !p.featured) return false;
      if (q && !`${p.nameRu} ${p.nameEn} ${p.line}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, line, only]);

  const toggle = (id: string, field: "visible" | "featured") => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    updateProduct(id, { [field]: !product[field] });
    onChange();
  };

  return (
    <>
      <div className="card mb-5 flex flex-wrap items-end gap-4 p-4">
        <label className="min-w-[220px] flex-1">
          <span className="field-label">Поиск</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название или линейка"
            className="field"
          />
        </label>

        <label>
          <span className="field-label">Линейка</span>
          <select value={line} onChange={(e) => setLine(e.target.value)} className="field !w-auto">
            <option value="">Все</option>
            {lines.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Показать</span>
          <select value={only} onChange={(e) => setOnly(e.target.value as typeof only)} className="field !w-auto">
            <option value="all">Все товары</option>
            <option value="hidden">Только скрытые</option>
            <option value="featured">Только с главной</option>
          </select>
        </label>

        <p className="ml-auto pb-3 text-[13px] text-muted">
          {filtered.length} {plural(filtered.length, ["товар", "товара", "товаров"])}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-[16px]">Ничего не нашлось</p>
        </div>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {filtered.map((p) => (
            <li key={p.id} className={`flex items-center gap-4 p-3 sm:p-4 ${p.visible ? "" : "bg-sand/60"}`}>
              <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-lg border border-line bg-sand">
                {p.image ? (
                  <Image src={withBasePath(p.image)} alt="" fill sizes="56px" className="object-contain p-1" unoptimized />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-muted">нет фото</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px]">{p.nameEn || p.nameRu}</p>
                <p className="mt-0.5 truncate text-[13px] text-muted">
                  {p.line} · {CATEGORIES[p.category as CategoryKey] ?? CATEGORIES.other}
                </p>
              </div>

              <p className="hidden w-[110px] shrink-0 text-right text-[15px] tabular-nums sm:block">{rub(p.price)}</p>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggle(p.id, "visible")}
                  className={`rounded-pill border px-3 py-1.5 text-[12px] ${
                    p.visible ? "border-line bg-paper text-ink-soft" : "border-transparent bg-sand-deep text-muted"
                  }`}
                >
                  {p.visible ? "В каталоге" : "Скрыт"}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(p.id, "featured")}
                  className={`rounded-pill border px-3 py-1.5 text-[12px] ${
                    p.featured ? "border-olive bg-olive-soft text-olive-deep" : "border-line bg-paper text-muted"
                  }`}
                >
                  Главная
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
