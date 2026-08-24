"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/catalog";
import { rub, plural } from "@/lib/format";
import { productImageBg } from "@/lib/image-bg";
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
  imageBg?: string;
  visible: boolean;
  featured: boolean;
};

function ProductActionsMenu({
  product,
  open,
  onOpenChange,
  onToggle,
}: {
  product: ListProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (id: string, field: "visible" | "featured") => void;
}) {
  useEffect(() => {
    if (!open) return;
    const close = () => onOpenChange(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open, onOpenChange]);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-paper text-ink-soft"
        aria-label={`Управление: ${product.nameEn || product.nameRu}`}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="19" cy="12" r="1.75" />
        </svg>
      </button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" aria-label="Закрыть меню" onClick={() => onOpenChange(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-[0_12px_32px_rgba(27,36,48,.12)]">
            <button
              type="button"
              className="block w-full px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-sand"
              onClick={() => {
                onToggle(product.id, "visible");
                onOpenChange(false);
              }}
            >
              {product.visible ? "Скрыть из каталога" : "Показать в каталоге"}
            </button>
            <button
              type="button"
              className="block w-full px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-sand"
              onClick={() => {
                onToggle(product.id, "featured");
                onOpenChange(false);
              }}
            >
              {product.featured ? "Убрать с главной" : "Показать на главной"}
            </button>
            <Link
              href={`/master/products/edit?id=${product.id}`}
              className="block px-4 py-2.5 text-[14px] transition-colors hover:bg-sand"
              onClick={() => onOpenChange(false)}
            >
              Изменить
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

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
  const [menuId, setMenuId] = useState<string | null>(null);

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
    const item = products.find((p) => p.id === id);
    if (!item) return;
    updateProduct(id, { [field]: !item[field] });
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
          <p className="mt-2 text-[14px] text-ink-soft">Измените запрос или сбросьте фильтры.</p>
        </div>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {filtered.map((p) => (
            <li key={p.id} className={`flex min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4 ${p.visible ? "" : "bg-sand/60"}`}>
              <Link
                href={`/master/products/edit?id=${p.id}`}
                className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg border border-line sm:h-[56px] sm:w-[56px]"
                style={{ backgroundColor: productImageBg(p.imageBg) }}
              >
                {p.image ? (
                  <Image
                    src={p.image.startsWith("data:") ? p.image : withBasePath(p.image)}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-muted">нет фото</span>
                )}
              </Link>

              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-[15px] leading-snug">
                  <Link href={`/master/products/edit?id=${p.id}`} className="transition-colors hover:text-olive-deep">
                    {p.nameEn || p.nameRu}
                  </Link>
                </p>
                <p className="mt-0.5 truncate text-[13px] text-muted">
                  {p.line} · {CATEGORIES[p.category as CategoryKey] ?? CATEGORIES.other}
                  {p.volume ? ` · ${p.volume}` : ""}
                </p>
                <p className="mt-1 text-[14px] tabular-nums sm:hidden">{rub(p.price)}</p>
              </div>

              <p className="hidden w-[110px] shrink-0 text-right text-[15px] tabular-nums sm:block">{rub(p.price)}</p>

              <ProductActionsMenu
                product={p}
                open={menuId === p.id}
                onOpenChange={(open) => setMenuId(open ? p.id : null)}
                onToggle={toggle}
              />

              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
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
                <Link href={`/master/products/edit?id=${p.id}`} className="btn btn-soft btn-sm !px-3">
                  Изменить
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
