import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/seo";
import { telHref } from "@/lib/settings";
import type { ProductView } from "@/lib/products";

export function LocalBusinessJsonLd() {
  const s = getSettings();
  const phone = telHref(s.phone).replace("tel:", "");

  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: s.salonName,
    description: s.heroText,
    url: absoluteUrl("/"),
    telephone: phone,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Комсомольский проспект, 51А",
      addressLocality: "Пермь",
      addressCountry: "RU",
    },
    openingHours: "Mo-Sa 10:00-20:00",
    sameAs: [s.telegram, s.whatsapp, s.instagram].filter((u) => u && u !== "#"),
    priceRange: "₽₽",
    areaServed: "Пермь",
    employee: {
      "@type": "Person",
      name: s.masterName,
      jobTitle: "Парикмахер-стилист, амбассадор Davines",
    },
    founder: {
      "@type": "Person",
      name: s.masterName,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({ product }: { product: ProductView }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameEn || product.nameRu,
    description: product.description,
    image: absoluteUrl(product.image),
    brand: { "@type": "Brand", name: "Davines" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/shop/${product.slug}/`),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
