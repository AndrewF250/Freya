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
    <header className="border-b border-line bg-paper">
      <div className="shell flex h-16 items-center gap-6">
        <Link href="/master/products" className="wordmark text-[18px]">
          Кабинет
        </Link>
        <nav className="flex gap-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[14px] ${pathname.startsWith(item.href) ? "text-ink" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex gap-2">
          <Link href="/" className="btn btn-soft btn-sm">
            На сайт
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-sm"
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
