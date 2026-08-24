import type { Metadata } from "next";
import { BookingForm } from "@/components/booking-form";
import { PageHead } from "@/components/ui";
import { SERVICES, SERVICE_TITLES } from "@/lib/services";
import { telHref } from "@/lib/settings";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Запись на приём",
  description: "Запишитесь к Кристине: диагностика, стрижка, цвет, реконструкция и подбор домашнего ухода Davines.",
};

export default function BookingPage() {
  const settings = getSettings();

  return (
    <>
      <PageHead
        eyebrow="Запись"
        title="Записаться к Кристине"
        text="Оставьте заявку на сайте или сразу напишите Кристине в Telegram с заполненными данными."
      />

      <div className="shell section grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <BookingForm services={SERVICE_TITLES} />

        <aside className="lg:sticky lg:top-[92px] lg:self-start">
          <div className="card-flat p-5">
            <p className="eyebrow">Студия</p>
            <p className="mt-3 text-[15px]">{settings.address}</p>
            <p className="mt-1 text-[14px] text-ink-soft">{settings.hours}</p>
            <a href={telHref(settings.phone)} className="mt-4 block text-[15px] transition-colors hover:text-olive-deep">
              {settings.phone}
            </a>
          </div>

          <div className="mt-5 border-t border-line pt-6">
            <p className="eyebrow mb-4">Услуги и время</p>
            <ul className="space-y-4">
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[14px]">{s.title}</p>
                    <p className="shrink-0 text-[13px] text-muted">{s.duration}</p>
                  </div>
                  <p className="mt-0.5 text-[13px] text-olive-deep">{s.price}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
