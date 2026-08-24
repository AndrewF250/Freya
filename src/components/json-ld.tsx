import { getSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/seo";
import { telHref } from "@/lib/settings";

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
    sameAs: [s.telegram, s.whatsapp, s.instagram].filter((u) => u && !u.endsWith("instagram.com/")),
    priceRange: "₽₽",
    areaServed: "Пермь",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
