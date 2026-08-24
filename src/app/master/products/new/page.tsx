"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProductForm } from "@/components/master/product-form";
import { sortLines } from "@/lib/catalog";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { getStoredProducts } from "@/lib/master-store";

export default function NewProductPage() {
  const router = useRouter();
  const products = getStoredProducts();
  const lines = sortLines([...new Set(products.map((p) => p.line))]);

  useEffect(() => {
    if (!isMasterAuthenticated()) router.replace("/master");
  }, [router]);

  return (
    <div className="shell py-10">
      <nav className="mb-6 text-[13px] text-muted">
        <Link href="/master/products" className="transition-colors hover:text-ink">
          Товары
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-ink-soft">Новый товар</span>
      </nav>

      <h1 className="display mb-8 text-[30px]">Новый товар</h1>
      <ProductForm lines={lines} />
    </div>
  );
}
