"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./cart";

type Input = Omit<CartItem, "qty">;

/** Компактная кнопка «+» для карточки в сетке. */
export function AddButton({ product }: { product: Input }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      aria-label={`Добавить «${product.nameRu}» в корзину`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-line bg-paper text-ink transition-colors hover:border-navy hover:bg-navy hover:text-white"
    >
      {added ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
          <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

/** Блок с количеством и крупной кнопкой — для страницы товара. */
export function AddToCartBlock({ product }: { product: Input }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-pill border border-line bg-paper">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-11 w-11 rounded-pill text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
          disabled={qty <= 1}
          aria-label="Уменьшить количество"
        >
          −
        </button>
        <span className="w-8 text-center text-[15px] tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(99, q + 1))}
          className="h-11 w-11 rounded-pill text-ink-soft transition-colors hover:text-ink"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          add(product, qty);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        className="btn btn-primary min-w-[190px]"
      >
        {added ? "Добавлено в корзину" : "В корзину"}
      </button>
    </div>
  );
}

/** Кладёт в корзину сразу несколько продуктов — используется в результате квиза. */
export function AddRitualButton({ products, label = "Добавить в корзину" }: { products: Input[]; label?: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        products.forEach((p) => add(p));
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
      className="btn btn-primary"
    >
      {added ? "Набор в корзине" : label}
    </button>
  );
}
