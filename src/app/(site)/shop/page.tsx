import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";
import { PageHead } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { getVisibleProducts } from "@/lib/products";
import { sortLines } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог Davines",
  description:
    "Купить Davines в Перми у амбассадора бренда: шампуни, маски, масла и стайлинг с подбором под тип волос.",
  alternates: { canonical: "/shop/" },
};

export default function ShopPage() {
  const products = getVisibleProducts();
  const lines = sortLines([...new Set(products.map((p) => p.line))]);

  return (
    <>
      <PageHead
        eyebrow="Продукция"
        title="Каталог Davines"
        text="Всё, что я использую в работе и рекомендую домой. Цены актуальные — я обновляю их вручную. Если нужного продукта нет в списке, напишите: привезу под заказ."
        photo={PHOTOS.still1}
      />
      <Suspense fallback={<div className="shell section min-h-[40vh]" aria-busy="true" />}>
        <ShopBrowser products={products} lines={lines} />
      </Suspense>
    </>
  );
}
