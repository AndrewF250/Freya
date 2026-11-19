import { products } from "./data";

export type ProductView = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  line: string;
  category: string;
  volume: string;
  price: number;
  oldPrice: number | null;
  description: string;
  usage: string;
  image: string;
  imageBg?: string;
  concerns: string[];
  hairTypes: string[];
  visible: boolean;
  featured: boolean;
  sortOrder?: number;
  /** Поля из карточки davines.ru */
  lineTagline?: string;
  series?: string[];
  sku?: string;
  suitability?: string;
  keyIngredient?: string;
  pairing?: string;
  composition?: string;
  specs?: { name: string; value: string }[];
  variants?: { volume: string; slug: string }[];
  /** «Сопутствующие товары» с davines.ru — slug наших товаров. */
  related?: string[];
  gallery?: string[];
  sourceUrl?: string;
};

type SortableProduct = {
  featured?: boolean;
  sortOrder?: number;
  nameRu?: string;
  price?: number;
};

export function compareByPopularity(a: SortableProduct, b: SortableProduct): number {
  if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.nameRu ?? "").localeCompare(b.nameRu ?? "", "ru");
}

const sorted = [...products]
  .filter((p) => p.visible !== false)
  .sort(compareByPopularity);

export function getVisibleProducts(): ProductView[] {
  return sorted;
}

/** Наборы и мини-форматы не подставляем на витрину главной — только полноразмерный уход. */
const SHOWCASE_SKIP = new Set(["set", "mini"]);

export function getFeaturedProducts(limit = 8): ProductView[] {
  const featured = sorted.filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const seenLines = new Set<string>();
  // По одному продукту из каждой линии/серии, чтобы витрина была разнообразной.
  const filler = sorted.filter((p) => {
    if (p.featured || SHOWCASE_SKIP.has(p.category)) return false;
    const key = p.series?.[0] ?? p.line;
    if (seenLines.has(key)) return false;
    seenLines.add(key);
    return true;
  });
  return [...featured, ...filler].slice(0, limit);
}

export function getProductBySlug(slug: string): ProductView | null {
  return sorted.find((p) => p.slug === slug) ?? null;
}

export function getRelated(product: ProductView, limit = 4): ProductView[] {
  // Сначала — подборка «Сопутствующие товары» с официального сайта Davines, в её порядке.
  if (product.related?.length) {
    const bySlug = new Map<string, ProductView>(sorted.map((p) => [p.slug, p]));
    const official = product.related.map((s) => bySlug.get(s)).filter((p): p is ProductView => Boolean(p));
    if (official.length) return official.slice(0, Math.max(limit, 8));
  }
  const variantSlugs = new Set((product.variants ?? []).map((v) => v.slug));
  const series = product.series?.[0];
  const sameSeries = series
    ? sorted.filter((p) => p.series?.includes(series) && p.id !== product.id && !variantSlugs.has(p.slug))
    : [];
  const sameLine = [
    ...sameSeries,
    ...sorted.filter(
      (p) => p.line === product.line && p.id !== product.id && !variantSlugs.has(p.slug) && !sameSeries.includes(p),
    ),
  ].slice(0, limit);
  if (sameLine.length >= limit) return sameLine;

  const used = new Set([product.id, ...sameLine.map((p) => p.id)]);
  const sameCategory = sorted
    .filter((p) => p.category === product.category && !used.has(p.id))
    .slice(0, limit - sameLine.length);
  return [...sameLine, ...sameCategory];
}

export function getProductsBySlugs(slugs: string[]): ProductView[] {
  if (slugs.length === 0) return [];
  const set = new Set(slugs);
  return sorted.filter((p) => set.has(p.slug));
}

export function getLineCounts(): { line: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of sorted) {
    map.set(p.line, (map.get(p.line) ?? 0) + 1);
  }
  return [...map.entries()].map(([line, count]) => ({ line, count }));
}
