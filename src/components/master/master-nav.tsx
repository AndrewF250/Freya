"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutMaster } from "@/lib/master-auth";

const NAV = [
  { href: "/master/products", label: "Товары" },
  { href: "/master/leads", label: "Заявки" },
  { href: "/master/settings", label: "Настройки" },
];

export function MasterNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="shell flex h-14 items-center gap-3 sm:h-16 sm:gap-6">
        <Link href="/master/products" className="wordmark shrink-0 text-[16px] sm:text-[18px]">
          Кабинет
        </Link>
        <nav className="flex min-w-0 flex-1 gap-3 overflow-x-auto text-[13px] sm:gap-5 sm:text-[14px]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 py-2 ${pathname.startsWith(item.href) ? "text-ink" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 gap-2">
          <Link href="/" className="btn btn-soft btn-sm !px-3">
            На сайт
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-sm !px-3"
            onClick={() => {
              logoutMaster();
              router.push("/master");
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
