import { Suspense } from "react";
import type { Metadata } from "next";
import { CareMosaic } from "@/components/care-mosaic";
import { ShopBrowser } from "@/components/shop-browser";
import { FadeIn } from "@/components/motion";
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
        photo={PHOTOS.careShampoo}
      />
      <section className="border-b border-line bg-sand">
        <div className="shell grid items-center gap-8 py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 lg:py-12">
          <FadeIn>
            <p className="eyebrow mb-3">Категории</p>
            <h2 className="display text-[26px] md:text-[34px]">Уход по шагам</h2>
            <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-ink-soft">
              Шампунь, кондиционер, маска, несмываемый уход и стайлинг — каждый шаг решает свою задачу.
              В каталоге можно отфильтровать по линейке и типу волос.
            </p>
          </FadeIn>
          <CareMosaic className="aspect-[4/3] min-h-[240px] md:aspect-auto md:min-h-[320px]" />
        </div>
      </section>
      <Suspense fallback={<div className="shell section min-h-[40vh]" aria-busy="true" />}>
        <ShopBrowser products={products} lines={lines} />
      </Suspense>
    </>
  );
}
