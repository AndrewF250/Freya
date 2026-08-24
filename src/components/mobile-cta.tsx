"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSettings } from "@/lib/settings";

const HIDDEN_ON = ["/booking", "/cart", "/master"];

export function MobileCta() {
  const pathname = usePathname();
  const settings = getSettings();

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur-md md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg gap-2">
        <Link href="/quiz" className="btn btn-outline btn-sm flex-1 !px-3">
          Подбор
        </Link>
        <a
          href={settings.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm flex-1 !px-3"
        >
          Telegram
        </a>
      </div>
    </div>
  );
}
