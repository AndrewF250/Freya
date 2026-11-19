import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartBlock } from "@/components/add-to-cart";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { getProductBySlug, getRelated, getVisibleProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { catalogFrom, catalogLabel, LINE_TAGLINES } from "@/lib/catalog";
import { rub } from "@/lib/format";

export function generateStaticParams() {
  return getVisibleProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then((p) => {
    const product = getProductBySlug(p.slug);
    if (!product) return { title: "Продукт не найден" };
    return {
      title: `${product.nameEn || product.nameRu} — Davines ${product.line}`,
      description: `${(product.description || product.nameRu).replace(/\s+/g, " ").slice(0, 130)} Купить в салоне ФРЕЯ, Пермь.`,
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
  const catalog = catalogFrom(settings);
  const categoryLabel = catalogLabel(catalog.categories, product.category, "Другое");
  const lineTagline = product.lineTagline || LINE_TAGLINES[product.line] || "";
  const variants = product.variants ?? [];
  // Ярлыки — только те, что есть в словаре каталога: эффекты продукта и типы волос из его описания.
  const tags = [
    ...product.concerns.flatMap((key) => {
      const entry = catalog.concerns.find((e) => e.key === key);
      return entry ? [{ label: entry.label, href: `/shop?concern=${encodeURIComponent(key)}` }] : [];
    }),
    ...product.hairTypes.flatMap((key) => {
      const entry = catalog.hairTypes.find((e) => e.key === key);
      return entry ? [{ label: entry.label, href: `/shop?hair=${encodeURIComponent(key)}` }] : [];
    }),
  ];
  const details = (
    [
      ["Подойдёт ли мне", product.suitability],
      ["Ключевой ингредиент", product.keyIngredient],
      ["С чем сочетать", product.pairing],
      ["Применение", product.usage],
    ] as const
  ).filter(([, text]) => Boolean(text)) as [string, string][];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Каталог", path: "/shop/" },
          { name: product.line, path: `/shop/?line=${encodeURIComponent(product.line)}` },
          { name: product.nameEn || product.nameRu, path: `/shop/${product.slug}/` },
        ]}
      />
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
        <ProductGallery
          images={product.gallery?.length ? product.gallery : product.image ? [product.image] : []}
          alt={product.nameEn || product.nameRu}
          bgColor={product.imageBg}
        />

        <div>
          <p className="eyebrow">
            {product.line}
            {product.series?.length ? ` · ${product.series.join(", ")}` : ""} · {categoryLabel}
            {product.featured ? " · Выбор Кристины" : ""}
          </p>
          <h1 className="display mt-3 text-[34px] md:text-[46px]">{product.nameEn || product.nameRu}</h1>
          {product.nameEn && product.nameRu !== product.nameEn && (
            <p className="mt-3 text-[15px] text-ink-soft">{product.nameRu}</p>
          )}

          <div className="mt-7 flex items-baseline gap-3">
            <p className="font-display text-[32px] leading-none tabular-nums">{rub(product.price)}</p>
            {product.oldPrice ? (
              <p className="text-[15px] text-muted line-through tabular-nums">{rub(product.oldPrice)}</p>
            ) : null}
            {product.volume && <p className="text-[14px] text-muted">/ {product.volume}</p>}
          </div>

          {variants.length > 1 && (
            <div className="mt-5">
              <p className="field-label">Объём</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) =>
                  v.slug === product.slug ? (
                    <span key={v.slug} className="chip" data-active="true" aria-current="page">
                      {v.volume}
                    </span>
                  ) : (
                    <Link key={v.slug} href={`/shop/${v.slug}`} className="chip">
                      {v.volume}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <AddToCartBlock
              product={{
                slug: product.slug,
                nameRu: product.nameRu,
                line: product.line,
                volume: product.volume,
                price: product.price,
                image: product.image,
                imageBg: product.imageBg,
              }}
            />
          </div>

          <Link href="/booking" className="btn btn-soft mt-3 w-full sm:w-auto">
            Записаться на диагностику с этим продуктом
          </Link>
          <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-muted">
            Разберём, подходит ли он вашим волосам, и соберём уход вокруг него. Результат подбора можно приложить к
            заявке.
          </p>

          {product.description && (
            <p className="mt-9 max-w-[54ch] text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">
              {product.description}
            </p>
          )}

          {tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Свойства продукта">
              {tags.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="tag">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <dl className="mt-9 divide-y divide-line border-t border-line text-[14px]">
            {details.map(([label, text]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                <dt className="text-muted">{label}</dt>
                <dd className="leading-relaxed whitespace-pre-line text-ink-soft">{text}</dd>
              </div>
            ))}
            {product.composition && (
              <div className="py-4">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-muted transition-colors hover:text-ink">
                    Состав
                    <span aria-hidden className="transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[12px] leading-relaxed break-words text-ink-soft">{product.composition}</p>
                </details>
              </div>
            )}
            <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
              <dt className="text-muted">Линия</dt>
              <dd className="text-ink-soft">
                <Link href={`/shop?line=${encodeURIComponent(product.line)}`} className="underline-offset-4 hover:underline">
                  Davines {product.line}
                </Link>
                {lineTagline ? ` — ${lineTagline}` : ""}
                {product.series?.map((s) => (
                  <span key={s}>
                    {" · "}
                    <Link href={`/shop?series=${encodeURIComponent(s)}`} className="underline-offset-4 hover:underline">
                      {s}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            {product.sku && (
              <div className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
                <dt className="text-muted">Артикул</dt>
                <dd className="tabular-nums text-ink-soft">{product.sku}</dd>
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
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
