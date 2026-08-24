"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./cart";
import { SalonLogo } from "./salon-logo";

const NAV = [
  { href: "/about", label: "О Кристине" },
  { href: "/shop", label: "Каталог" },
  { href: "/quiz", label: "Подбор ухода" },
  { href: "/booking", label: "Запись" },
  { href: "/contacts", label: "Контакты" },
];

export function SiteHeader({ salonName: _salonName }: { salonName: string }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/92 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
      <div className="shell flex h-[60px] items-center gap-3 sm:h-[68px] sm:gap-6">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3" aria-label="На главную">
          <SalonLogo />
          <span className="hidden whitespace-nowrap rounded-pill border border-line bg-paper px-2.5 py-1 text-[10px] tracking-[0.12em] text-muted uppercase md:inline">
            Партнёр Davines
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[14px] transition-colors hover:text-ink ${
                isActive(item.href) ? "text-ink" : "text-ink-soft"
              }`}
            >
              {item.label}
              {isActive(item.href) && <span className="mt-1 block h-px bg-olive" />}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:ml-0">
          <Link href="/cart" className="btn btn-soft btn-sm gap-1.5 !px-3 sm:gap-2 sm:!px-4" aria-label="Корзина">
            <CartIcon />
            <span className="hidden sm:inline">Корзина</span>
            {ready && count > 0 && (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-navy px-1 text-[11px] leading-none text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-soft btn-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            {open ? "Закрыть" : "Меню"}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-cream lg:hidden">
          <div className="shell flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-line-soft py-3.5 text-[15px] last:border-0 ${
                  isActive(item.href) ? "text-ink" : "text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.5L20.5 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.3" />
      <circle cx="17.5" cy="20" r="1.3" />
    </svg>
  );
}
