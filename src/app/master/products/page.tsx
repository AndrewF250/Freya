"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MasterProductList } from "@/components/master/product-list";
import { sortLines } from "@/lib/catalog";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { downloadJson, exportMasterData, getStoredProducts, resetMasterData } from "@/lib/master-store";

export default function MasterProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState(getStoredProducts());

  useEffect(() => {
    if (!isMasterAuthenticated()) router.replace("/master");
  }, [router]);

  const lines = sortLines([...new Set(products.map((p) => p.line))]);

  return (
    <div className="shell py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px]">Товары</h1>
          <p className="mt-2 text-[14px] text-muted">Изменения сохраняются в браузере. Экспортируйте JSON для публикации.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const data = exportMasterData();
              downloadJson("products.json", data.products);
            }}
          >
            Экспорт товаров
          </button>
          <button
            type="button"
            className="btn btn-soft btn-sm"
            onClick={() => {
              resetMasterData();
              setProducts(getStoredProducts());
            }}
          >
            Сбросить
          </button>
        </div>
      </div>

      <MasterProductList products={products} lines={lines} onChange={() => setProducts(getStoredProducts())} />
    </div>
  );
}
