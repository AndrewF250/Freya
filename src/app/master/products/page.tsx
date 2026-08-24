"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MasterProductList } from "@/components/master/product-list";
import { sortLines } from "@/lib/catalog";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { downloadJson, exportMasterData, getStoredProducts, resetMasterData } from "@/lib/master-store";

function MasterProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleted = searchParams.get("deleted") === "1";
  const [products, setProducts] = useState(getStoredProducts());

  useEffect(() => {
    if (!isMasterAuthenticated()) router.replace("/master");
  }, [router]);

  const lines = sortLines([...new Set(products.map((p) => p.line))]);
  const hidden = products.filter((p) => !p.visible).length;
  const featured = products.filter((p) => p.featured).length;

  return (
    <div className="shell py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px] sm:text-[30px]">Товары</h1>
          <p className="mt-2 text-[14px] text-ink-soft">
            {products.length} в каталоге · {hidden} скрыто · {featured} на главной
          </p>
        </div>
        <Link href="/master/products/new" className="btn btn-primary w-full sm:w-auto">
          Добавить товар
        </Link>
      </div>

      {deleted && (
        <p className="mb-5 rounded-lg border border-line bg-sand px-4 py-3 text-[14px]">Товар удалён.</p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
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

      <MasterProductList products={products} lines={lines} onChange={() => setProducts(getStoredProducts())} />
    </div>
  );
}

export default function MasterProductsPage() {
  return (
    <Suspense fallback={<div className="shell py-10 text-muted">Загрузка…</div>}>
      <MasterProductsContent />
    </Suspense>
  );
}
