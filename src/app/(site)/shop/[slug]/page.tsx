import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartBlock } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { getProductBySlug, getRelated, getVisibleProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { CATEGORIES, CONCERNS, HAIR_TYPES, type CategoryKey, type ConcernKey, type HairTypeKey } from "@/lib/catalog";
import { rub } from "@/lib/format";

export function generateStaticParams() {
  return getVisibleProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then((p) => {
    const product = getProductBySlug(p.slug);
    if (!product) return { title: "Продукт не найден" };
    return {
      title: `${product.nameEn || product.nameRu} — ${product.line}`,
      description: product.description.slice(0, 160),
      alternates: { canonical: `/shop/${product.slug}/` },
    };
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelated(product);
  const settings = getSettings();
  const categoryLabel = CATEGORIES[product.category as CategoryKey] ?? CATEGORIES.other;

  return (
    <>
      <div className="shell pt-8">
        <nav aria-label="Хлебные крошки" className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
          <Link href="/shop" className="transition-colors hover:text-ink">
            Каталог
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/shop?line=${encodeURIComponent(product.line)}`} className="transition-colors hover:text-ink">
            {product.line}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink-soft">{product.nameEn || product.nameRu}</span>
        </nav>
      </div>

      <section className="shell grid gap-10 py-10 md:grid-cols-2 md:gap-16 md:py-14">
        <ProductImage
          src={product.image}
          alt={product.nameEn || product.nameRu}
          sizes="(max-width: 768px) 100vw, 45vw"
          priority
          className="aspect-square rounded-card border border-line"
        />

        <div>
          <p className="eyebrow">
            {product.line} · {categoryLabel}
          </p>
          <h1 className="display mt-3 text-[34px] md:text-[46px]">{product.nameEn || product.nameRu}</h1>
          <p className="mt-3 text-[15px] text-ink-soft">{product.nameRu}</p>

          <div className="mt-7 flex items-baseline gap-3">
            <p className="font-display text-[32px] leading-none tabular-nums">{rub(product.price)}</p>
            {product.oldPrice ? (
              <p className="text-[15px] text-muted line-through tabular-nums">{rub(product.oldPrice)}</p>
            ) : null}
            {product.volume && <p className="text-[14px] text-muted">/ {product.volume}</p>}
          </div>

          <div className="mt-8">
            <AddToCartBlock
              product={{
                slug: product.slug,
                nameRu: product.nameRu,
                line: product.line,
                volume: product.volume,
                price: product.price,
                image: product.image,
              }}
            />
          </div>

          <Link href="/booking" className="btn btn-soft mt-3 w-full sm:w-auto">
            Консультация по этому продукту
          </Link>

          {product.description && (
            <p className="mt-9 max-w-[54ch] text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
          )}

          {(product.concerns.length > 0 || product.hairTypes.length > 0) && (
            <div className="mt-8 flex flex-wrap gap-2">
              {product.concerns.map((c) => (
                <span key={c} className="badge">
                  {CONCERNS[c as ConcernKey] ?? c}
                </span>
              ))}
              {product.hairTypes.map((h) => (
                <span key={h} className="chip !cursor-default">
                  {HAIR_TYPES[h as HairTypeKey] ?? h}
                </span>
              ))}
            </div>
          )}

          <dl className="mt-9 divide-y divide-line border-t border-line text-[14px]">
            {product.usage && (
              <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                <dt className="text-muted">Применение</dt>
                <dd className="leading-relaxed text-ink-soft">{product.usage}</dd>
              </div>
            )}
            <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
              <dt className="text-muted">Бренд</dt>
              <dd className="text-ink-soft">Davines, Италия</dd>
            </div>
            {product.volume && (
              <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                <dt className="text-muted">Объём</dt>
                <dd className="text-ink-soft">{product.volume}</dd>
              </div>
            )}
            <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
              <dt className="text-muted">Доставка и оплата</dt>
              <dd className="leading-relaxed text-ink-soft">{settings.deliveryText}</dd>
            </div>
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section border-t border-line">
          <div className="shell">
            <h2 className="display text-[26px] md:text-[32px]">Хорошо работает вместе</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
