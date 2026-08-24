"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductForm } from "@/components/master/product-form";
import { sortLines } from "@/lib/catalog";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { getProductById, getStoredProducts } from "@/lib/master-store";

function EditProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const created = searchParams.get("created") === "1";
  const [products, setProducts] = useState(getStoredProducts());
  const product = id ? getProductById(id) : undefined;
  const lines = sortLines([...new Set(products.map((p) => p.line))]);

  useEffect(() => {
    if (!isMasterAuthenticated()) router.replace("/master");
    else if (id && !getProductById(id)) router.replace("/master/products");
  }, [router, id]);

  useEffect(() => {
    setProducts(getStoredProducts());
  }, [id]);

  if (!id || !product) return null;

  return (
    <div className="shell py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <Link href="/master/products" className="transition-colors hover:text-ink">
          Товары
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink-soft">{product.nameEn || product.nameRu}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display max-w-[24ch] text-[30px]">{product.nameEn || product.nameRu}</h1>
        {product.visible && (
          <Link href={`/shop/${product.slug}`} target="_blank" className="btn btn-soft btn-sm">
            Открыть на сайте ↗
          </Link>
        )}
      </div>

      <ProductForm
        lines={lines}
        justCreated={created}
        product={{
          id: product.id,
          nameRu: product.nameRu,
          nameEn: product.nameEn,
          line: product.line,
          category: product.category,
          volume: product.volume,
          price: product.price,
          oldPrice: product.oldPrice,
          description: product.description,
          usage: product.usage,
          image: product.image,
          imageBg: product.imageBg,
          concerns: product.concerns,
          hairTypes: product.hairTypes,
          visible: product.visible,
          featured: product.featured,
        }}
      />
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="shell py-10 text-muted">Загрузка…</div>}>
      <EditProductContent />
    </Suspense>
  );
}
