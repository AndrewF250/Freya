import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { YandexMap } from "@/components/yandex-map";
import { telHref } from "@/lib/settings";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Салон ФРЕЯ, Перм: Комсомольский проспект 51А. Телефон, Telegram @bochkariova_cris, часы работы и карта.",
  alternates: { canonical: "/contacts/" },
};

export default function ContactsPage() {
  const settings = getSettings();

  const socials = [
    { href: settings.telegram, label: "Telegram" },
    { href: settings.whatsapp, label: "WhatsApp" },
    { href: settings.instagram, label: "Instagram" },
  ].filter((s) => s.href && s.href !== "#");

  return (
    <>
      <PageHead
        eyebrow="Контакты"
        title="Как нас найти"
        text="Студия на Комсомольском, 51А. Напишите в Telegram @bochkariova_cris, позвоните или оставьте заявку на сайте."
      />

      <section className="shell section grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <dl className="divide-y divide-line border-t border-line">
            <Row label="Телефон">
              <a href={telHref(settings.phone)} className="transition-colors hover:text-olive-deep">
                {settings.phone}
              </a>
            </Row>
            <Row label="E-mail">
              <a href={`mailto:${settings.email}`} className="transition-colors hover:text-olive-deep">
                {settings.email}
              </a>
            </Row>
            <Row label="Адрес">{settings.address}</Row>
            <Row label="Часы работы">{settings.hours}</Row>
            <Row label="Мастер">
              {settings.masterName} — {settings.masterTitle.toLowerCase()}
            </Row>
          </dl>

          {socials.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow mb-3">Написать</p>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="btn btn-soft btn-sm">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="card-flat mt-8 p-5">
            <p className="text-[15px]">Доставка и оплата</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{settings.deliveryText}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/booking" className="btn btn-primary w-full sm:w-auto">
              Записаться
            </Link>
            <a
              href={settings.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full sm:w-auto"
            >
              Написать в Telegram
            </a>
          </div>
        </div>

        <YandexMap settings={settings} />
      </section>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="text-[15px]">{children}</dd>
    </div>
  );
}
