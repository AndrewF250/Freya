import Link from "next/link";
import { AddButton } from "./add-to-cart";
import { ProductImage } from "./product-image";
import { rub } from "@/lib/format";
import { CATEGORIES, type CategoryKey } from "@/lib/catalog";

export type CardProduct = {
  slug: string;
  nameRu: string;
  nameEn: string;
  line: string;
  category: string;
  volume: string;
  price: number;
  oldPrice?: number | null;
  image: string;
};

export function ProductCard({ product, priority = false }: { product: CardProduct; priority?: boolean }) {
  const categoryLabel = CATEGORIES[product.category as CategoryKey] ?? CATEGORIES.other;

  return (
    <article className="card group relative flex flex-col overflow-hidden transition-colors hover:border-muted">
      <Link href={`/shop/${product.slug}`} className="block" tabIndex={-1} aria-hidden>
        <ProductImage
          src={product.image}
          alt={product.nameEn || product.nameRu}
          priority={priority}
          className="aspect-square"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow">{product.line}</p>

        <h3 className="mt-2 text-[15px] leading-snug font-normal">
          <Link href={`/shop/${product.slug}`} className="transition-colors hover:text-olive-deep">
            <span className="absolute inset-0" aria-hidden />
            {product.nameEn || product.nameRu}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">
          {categoryLabel}
          {product.volume ? ` · ${product.volume}` : ""}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 pt-1">
          <div>
            {product.oldPrice ? (
              <p className="text-[12px] text-muted line-through">{rub(product.oldPrice)}</p>
            ) : null}
            <p className="text-[16px] tabular-nums">{rub(product.price)}</p>
          </div>
          <div className="relative z-10">
            <AddButton
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
        </div>
      </div>
    </article>
  );
}
