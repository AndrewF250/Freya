"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./cart";

type Input = Omit<CartItem, "qty">;

export function CartQtyControl({
  product,
  size = "compact",
}: {
  product: Input;
  size?: "compact" | "lg";
}) {
  const { items, add, setQty, ready } = useCart();
  const qty = items.find((i) => i.slug === product.slug)?.qty ?? 0;
  const compact = size === "compact";

  if (!ready) {
    return (
      <span
        className={
          compact
            ? "inline-flex h-8 w-8 shrink-0 rounded-pill border border-line bg-paper"
            : "inline-flex h-11 min-w-[190px] rounded-pill border border-line bg-paper"
        }
        aria-hidden
      />
    );
  }

  if (qty <= 0) {
    return (
      <button
        type="button"
        onClick={() => add(product)}
        aria-label={`Добавить «${product.nameRu}» в корзину`}
        className={
          compact
            ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border border-line bg-paper text-ink transition-colors hover:border-navy hover:bg-navy hover:text-white sm:h-9 sm:w-9"
            : "btn btn-primary min-w-[190px]"
        }
      >
        {compact ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        ) : (
          "В корзину"
        )}
      </button>
    );
  }

  return (
    <div
      className={
        compact
          ? "flex h-8 shrink-0 items-center rounded-pill border border-navy bg-navy text-white sm:h-9"
          : "flex h-11 items-center rounded-pill border border-navy bg-navy text-white"
      }
    >
      <button
        type="button"
        onClick={() => setQty(product.slug, qty - 1)}
        className={compact ? "h-8 w-7 text-[16px] leading-none sm:h-9 sm:w-8" : "h-11 w-11 text-[18px] leading-none"}
        aria-label="Уменьшить количество"
      >
        −
      </button>
      <span
        className={compact ? "min-w-[1.1rem] text-center text-[12px] tabular-nums sm:text-[13px]" : "min-w-[1.75rem] text-center text-[15px] tabular-nums"}
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty(product.slug, Math.min(99, qty + 1))}
        className={compact ? "h-8 w-7 text-[16px] leading-none sm:h-9 sm:w-8" : "h-11 w-11 text-[18px] leading-none"}
        aria-label="Увеличить количество"
        disabled={qty >= 99}
      >
        +
      </button>
    </div>
  );
}

/** Блок с количеством, привязанный к корзине — для страницы товара. */
export function AddToCartBlock({ product }: { product: Input }) {
  const { items, add, setQty, ready } = useCart();
  const qty = items.find((i) => i.slug === product.slug)?.qty ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-pill border border-line bg-paper">
        <button
          type="button"
          onClick={() => {
            if (qty <= 0) return;
            setQty(product.slug, qty - 1);
          }}
          className="h-11 w-11 rounded-pill text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
          disabled={!ready || qty <= 0}
          aria-label="Уменьшить количество"
        >
          −
        </button>
        <span className="w-8 text-center text-[15px] tabular-nums" aria-live="polite">
          {ready ? qty : "—"}
        </span>
        <button
          type="button"
          onClick={() => {
            if (qty <= 0) add(product);
            else setQty(product.slug, Math.min(99, qty + 1));
          }}
          className="h-11 w-11 rounded-pill text-ink-soft transition-colors hover:text-ink"
          aria-label="Увеличить количество"
          disabled={!ready || qty >= 99}
        >
          +
        </button>
      </div>

      {qty <= 0 ? (
        <button type="button" onClick={() => add(product)} disabled={!ready} className="btn btn-primary min-w-[190px]">
          В корзину
        </button>
      ) : (
        <p className="text-[14px] text-ink-soft">
          В корзине: <span className="tabular-nums text-ink">{qty}</span>
        </p>
      )}
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
