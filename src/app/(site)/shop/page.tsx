import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";
import { PageHead } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { catalogFrom, sortLines } from "@/lib/catalog";
import { getVisibleProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Купить Davines в Перми",
  description:
    "Каталог Davines в салоне ФРЕЯ, Перм: шампуни, маски, масла и стайлинг с подбором под тип волос. Оригинальная продукция, доставка по Перми и СДЭК.",
  alternates: { canonical: "/shop/" },
};

export default function ShopPage() {
  const catalog = catalogFrom(getSettings());
  const products = getVisibleProducts();
  const lines = sortLines([...new Set(products.map((p) => p.line))], catalog.lines);

  return (
    <>
      <PageHead
        eyebrow="Продукция"
        title="Каталог Davines"
        text="Всё, что я использую в работе и рекомендую домой. Цены актуальные — я обновляю их вручную. Если нужного продукта нет в списке, напишите: привезу под заказ."
        photo={PHOTOS.catShampoo}
      />
      <Suspense fallback={<div className="shell section min-h-[40vh]" aria-busy="true" />}>
        <ShopBrowser
          products={products}
          lines={lines}
          categories={catalog.categories}
          concerns={catalog.concerns}
        />
      </Suspense>
    </>
  );
}
