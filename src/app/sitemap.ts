import type { MetadataRoute } from "next";
import { getVisibleProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const staticPages = [
  { path: "/", priority: 1 },
  { path: "/shop/", priority: 0.9 },
  { path: "/quiz/", priority: 0.9 },
  { path: "/booking/", priority: 0.85 },
  { path: "/about/", priority: 0.8 },
  { path: "/contacts/", priority: 0.8 },
  { path: "/cart/", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = staticPages.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const products = getVisibleProducts().map((p) => ({
    url: absoluteUrl(`/shop/${p.slug}/`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...pages, ...products];
}
