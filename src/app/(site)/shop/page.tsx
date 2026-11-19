import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";
import { PageHead } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { catalogFrom, sortLines, sortSeries } from "@/lib/catalog";
import { getVisibleProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Купить Davines в Перми",
  description:
    "Каталог Davines в салоне ФРЕЯ, Пермь: шампуни, кондиционеры, маски, несмываемый уход и стайлинг всех линий — OI, Essential, NaturalTech, Heart of Glass, Alchemic, More Inside. Оригинальная продукция, доставка по Перми и СДЭК.",
  alternates: { canonical: "/shop/" },
};

export default function ShopPage() {
  const catalog = catalogFrom(getSettings());
  const products = getVisibleProducts();
  const lines = sortLines([...new Set(products.map((p) => p.line))], catalog.lines);
  const series = sortSeries([...new Set(products.flatMap((p) => p.series ?? []))]);
  // В клиентский фильтр отдаём только то, что нужно карточке, — без состава и описаний.
  const cards = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameRu: p.nameRu,
    nameEn: p.nameEn,
    line: p.line,
    series: p.series ?? [],
    category: p.category,
    volume: p.volume,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    imageBg: p.imageBg,
    featured: p.featured,
    sortOrder: p.sortOrder,
    concerns: p.concerns,
    hairTypes: p.hairTypes,
  }));

  return (
    <>
      <PageHead
        eyebrow="Продукция"
        title="Каталог Davines"
        text="Актуальный ассортимент Davines — как на официальном сайте бренда: все линии, серии и форматы. Если не знаете, что выбрать, напишите — подберу под ваши волосы."
        photo={PHOTOS.catShampoo}
      />
      <Suspense fallback={<div className="shell section min-h-[40vh]" aria-busy="true" />}>
        <ShopBrowser
          products={cards}
          lines={lines}
          series={series}
          categories={catalog.categories}
          concerns={catalog.concerns}
          hairTypes={catalog.hairTypes}
        />
      </Suspense>
    </>
  );
}
