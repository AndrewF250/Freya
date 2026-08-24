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
  concerns: string[];
  hairTypes: string[];
  visible: boolean;
  featured: boolean;
};

const sorted = [...products].sort((a, b) => a.sortOrder - b.sortOrder || a.nameRu.localeCompare(b.nameRu, "ru"));

export function getVisibleProducts(): ProductView[] {
  return sorted;
}

export function getFeaturedProducts(limit = 8): ProductView[] {
  const featured = sorted.filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  const filler = sorted.filter((p) => !p.featured);
  return [...featured, ...filler].slice(0, limit);
}

export function getProductBySlug(slug: string): ProductView | null {
  return sorted.find((p) => p.slug === slug) ?? null;
}

export function getRelated(product: ProductView, limit = 4): ProductView[] {
  const sameLine = sorted.filter((p) => p.line === product.line && p.id !== product.id).slice(0, limit);
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
