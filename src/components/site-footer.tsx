import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { telHref } from "@/lib/settings";

const NAV = [
  { href: "/about", label: "О Кристине" },
  { href: "/shop", label: "Каталог Davines" },
  { href: "/quiz", label: "Подбор ухода" },
  { href: "/booking", label: "Запись" },
  { href: "/contacts", label: "Контакты" },
];

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-auto bg-navy text-cream">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <p className="display max-w-[16ch] text-[30px] md:text-[36px]">Здоровые корни — подлинная красота</p>
          <p className="mt-5 max-w-[38ch] text-[14px] leading-relaxed text-cream/60">
            {settings.masterName} — {settings.masterTitle.toLowerCase()}. Уход, который поддерживает естественный
            потенциал волос и кожи головы.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <SocialLink href={settings.telegram} label="Telegram" />
            <SocialLink href={settings.whatsapp} label="WhatsApp" />
            <SocialLink href={settings.instagram} label="Instagram" />
          </div>
        </div>

        <nav>
          <p className="eyebrow text-cream/45">Навигация</p>
          <ul className="mt-5 space-y-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[14px] text-cream/75 transition-colors hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-cream/45">Контакты</p>
          <ul className="mt-5 space-y-3 text-[14px] text-cream/75">
            <li>
              <a href={telHref(settings.phone)} className="transition-colors hover:text-cream">
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="transition-colors hover:text-cream">
                {settings.email}
              </a>
            </li>
            <li>{settings.address}</li>
            <li className="text-cream/55">{settings.hours}</li>
          </ul>

          <div className="mt-7 rounded-card border border-navy-line p-4">
            <p className="text-[13px] text-cream">Партнёр Davines</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-cream/55">
              Итальянская наука и этичный подход к уходу за волосами.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-line">
        <div className="shell flex flex-col gap-2 py-6 text-[12px] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.salonName}
          </p>
          <p>
            Кабинет мастера —{" "}
            <Link href="/master" className="underline underline-offset-4 transition-colors hover:text-cream/80">
              вход
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  if (!href || href === "#") return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-pill border border-navy-line px-3.5 py-1.5 text-[12px] text-cream/70 transition-colors hover:border-cream/40 hover:text-cream"
    >
      {label}
    </a>
  );
}
