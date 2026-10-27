"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { catalogLabel, type ResolvedCatalog } from "@/lib/catalog";
import { rub } from "@/lib/format";
import {
  addCatalogEntry,
  addCatalogLine,
  removeCatalogEntry,
  removeCatalogLine,
} from "@/lib/master-catalog";
import { updateProduct } from "@/lib/master-store";
import type { ProductView } from "@/lib/products";
import { AddChip, FilterChip } from "./add-chip";

export function MasterProductCard({
  product,
  catalog,
  onChange,
}: {
  product: ProductView;
  catalog: ResolvedCatalog;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const categoryLabel = catalogLabel(catalog.categories, product.category, "Другое");

  function flash(message: string) {
    setError(message);
    window.setTimeout(() => setError(""), 2800);
  }

  function setCategory(key: string) {
    updateProduct(product.id, { category: key });
    onChange();
  }

  function setLine(line: string) {
    updateProduct(product.id, { line });
    onChange();
  }

  function toggleConcern(key: string) {
    const next = product.concerns.includes(key)
      ? product.concerns.filter((c) => c !== key)
      : [...product.concerns, key];
    updateProduct(product.id, { concerns: next });
    onChange();
  }

  function toggle(field: "visible" | "featured") {
    updateProduct(product.id, { [field]: !product[field] });
    onChange();
  }

  return (
    <article
      className={`card group relative flex min-w-0 flex-col overflow-visible transition-colors hover:border-muted ${
        product.visible ? "" : "bg-sand/70"
      }`}
    >
      <Link href={`/master/products/edit?id=${product.id}`} className="block overflow-hidden rounded-t-card" tabIndex={-1} aria-hidden>
        <ProductImage
          src={product.image}
          alt={product.nameEn || product.nameRu}
          bgColor={product.imageBg}
          className="aspect-square"
        />
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-1.5">
          <p className="eyebrow min-w-0">{product.line}</p>
          {product.featured ? <span className="badge max-w-full whitespace-normal">Выбор Кристины</span> : null}
        </div>

        <h3 className="mt-2 text-[14px] leading-snug font-normal sm:text-[15px]">
          <Link href={`/master/products/edit?id=${product.id}`} className="transition-colors hover:text-olive-deep">
            {product.nameEn || product.nameRu}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">
          {categoryLabel}
          {product.volume ? ` · ${product.volume}` : ""}
        </p>

        <div className="mt-auto pt-4">
          <p className="text-[16px] tabular-nums">{rub(product.price)}</p>
          <div className="relative z-10 mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => toggle("visible")}
              className={`rounded-pill border px-2.5 py-1 text-[11px] ${
                product.visible ? "border-line bg-paper text-ink-soft" : "border-transparent bg-sand-deep text-muted"
              }`}
            >
              {product.visible ? "В каталоге" : "Скрыт"}
            </button>
            <button
              type="button"
              onClick={() => toggle("featured")}
              className={`rounded-pill border px-2.5 py-1 text-[11px] ${
                product.featured ? "border-olive bg-olive-soft text-olive-deep" : "border-line bg-paper text-muted"
              }`}
            >
              Выбор
            </button>
            <Link href={`/master/products/edit?id=${product.id}`} className="btn btn-soft btn-sm !px-3 !py-1 !text-[12px]">
              Изменить
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-3 border-t border-line pt-3">
          <button
            type="button"
            className="text-[12px] text-ink-soft transition-colors hover:text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? "Скрыть ярлыки" : "Ярлыки: тип, задачи, линейка"}
          </button>

          {open && (
            <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-[min(320px,60vh)] space-y-3 overflow-y-auto rounded-card border border-line bg-paper p-3 shadow-[0_12px_32px_rgba(27,36,48,.12)]">
              <LabelGroup title="Тип продукта">
                {catalog.categories.map((c) => (
                  <FilterChip
                    key={c.key}
                    label={c.label}
                    active={product.category === c.key}
                    onSelect={() => setCategory(c.key)}
                    onRemove={() => {
                      const result = removeCatalogEntry("categories", c.key);
                      if (!result.ok) flash(result.message);
                      else onChange();
                    }}
                  />
                ))}
                <AddChip
                  placeholder="Новый тип"
                  onAdd={(label) => {
                    const result = addCatalogEntry("categories", label);
                    if (!result.ok) flash(result.message);
                    else {
                      updateProduct(product.id, { category: result.entry.key });
                      onChange();
                    }
                  }}
                />
              </LabelGroup>

              <LabelGroup title="Задачи">
                {catalog.concerns.map((c) => (
                  <FilterChip
                    key={c.key}
                    label={c.label}
                    active={product.concerns.includes(c.key)}
                    onSelect={() => toggleConcern(c.key)}
                    onRemove={() => {
                      const result = removeCatalogEntry("concerns", c.key);
                      if (!result.ok) flash(result.message);
                      else onChange();
                    }}
                  />
                ))}
                <AddChip
                  placeholder="Новая задача"
                  onAdd={(label) => {
                    const result = addCatalogEntry("concerns", label);
                    if (!result.ok) flash(result.message);
                    else {
                      updateProduct(product.id, { concerns: [...product.concerns, result.entry.key] });
                      onChange();
                    }
                  }}
                />
              </LabelGroup>

              <LabelGroup title="Линейка">
                {catalog.lines.map((l) => (
                  <FilterChip
                    key={l}
                    label={l}
                    active={product.line === l}
                    onSelect={() => setLine(l)}
                    onRemove={() => {
                      const result = removeCatalogLine(l);
                      if (!result.ok) flash(result.message);
                      else onChange();
                    }}
                  />
                ))}
                <AddChip
                  placeholder="Новая линейка"
                  onAdd={(label) => {
                    const result = addCatalogLine(label);
                    if (!result.ok) flash(result.message);
                    else {
                      updateProduct(product.id, { line: result.line });
                      onChange();
                    }
                  }}
                />
              </LabelGroup>

              {error && <p className="text-[12px] text-olive-deep">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function LabelGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

