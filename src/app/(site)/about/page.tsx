import type { Metadata } from "next";
import Link from "next/link";
import { SitePhoto } from "@/components/site-photo";
import { WorkPhotos } from "@/components/work-photos";
import { PageHead, SectionHead, Step } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { SERVICES } from "@/lib/services";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Студия ФРЕЯ — мастер и уход Davines",
  description:
    "Студия ФРЕЯ в Перми: Кристина — амбассадор Davines. Диагностика волос, подбор ухода, услуги и запись в салон на Комсомольском, 51А.",
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  const settings = getSettings();

  return (
    <>
      <PageHead
        eyebrow={settings.masterTitle}
        title={settings.masterName}
        text={settings.aboutText}
        photo={PHOTOS.catConditioner}
      />

      {/* ── Портрет и факты ──────────────────────────────── */}
      <section className="shell section grid items-center gap-10 md:grid-cols-[minmax(0,0.7fr)_1fr] md:gap-16 xl:gap-20">
        <SitePhoto
          src={PHOTOS.portrait.src}
          alt={PHOTOS.portrait.alt}
          fit="contain"
          sizes="(max-width: 768px) 70vw, 28vw"
          className="mx-auto aspect-[3/4] w-full max-w-[280px] rounded-card sm:max-w-[320px] md:mx-0 md:max-w-[360px]"
        />

        <div className="self-center">
          <h2 className="display text-[28px] md:text-[36px]">Почему Davines</h2>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
            Я перепробовала много профессиональных марок и остановилась на Davines — итальянском семейном бренде из
            Пармы. Их формулы построены вокруг конкретных растительных компонентов, у каждой линейки есть внятная
            задача, и бренд не прячет состав за маркетингом.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
            Как партнёр Davines я работаю с официальным дистрибьютором: продукция приходит свежими партиями, а я
            прохожу обучение по новым линейкам и обновлениям формул. Это значит, что рекомендация опирается не на
            рекламный буклет, а на то, как продукт ведёт себя в работе.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8">
            <Fact value="10+" label="лет в парикмахерском деле" />
            <Fact value="15" label="линеек Davines в работе" />
            <Fact value="45 мин" label="длится диагностика" />
            <Fact value="Парма" label="откуда приезжает продукция" />
          </dl>
        </div>
      </section>

      {/* ── Подход ───────────────────────────────────────── */}
      <section className="border-y border-line bg-sand">
        <div className="shell section">
          <SectionHead
            eyebrow="Подход"
            title="Сначала причина, потом продукт"
            text="Мне не интересно продать банку. Интересно, чтобы через месяц вы сказали, что волосы стали лучше."
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            <Step
              n="01"
              title="Смотрю на кожу головы"
              text="Большая часть жалоб на длину начинается у корней: себорегуляция, чувствительность, плотность роста."
            />
            <Step
              n="02"
              title="Считаюсь с вашей рутиной"
              text="Если вы моете голову каждый день и не сушите феном — схема будет другой. Уход должен вписаться в жизнь."
            />
            <Step
              n="03"
              title="Не перегружаю схему"
              text="Два-четыре продукта, которые вы реально будете использовать, лучше, чем полка нетронутых банок."
            />
          </div>
        </div>
      </section>

      {/* ── Услуги ───────────────────────────────────────── */}
      <section className="shell section">
        <SectionHead
          eyebrow="Услуги"
          title="С чем можно прийти"
          href="/booking"
          hrefLabel="Записаться"
        />
        <div className="mt-10 divide-y divide-line border-t border-line">
          {SERVICES.map((s) => (
            <div key={s.id} className="grid gap-2 py-6 md:grid-cols-[1fr_2fr_auto] md:items-baseline md:gap-8">
              <h3 className="text-[17px]">{s.title}</h3>
              <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-soft">{s.text}</p>
              <div className="text-[14px] md:text-right">
                <p className="text-muted">{s.duration}</p>
                <p className="mt-0.5 text-olive-deep">{s.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Студия ───────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="shell section grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <p className="eyebrow mb-3">Студия</p>
            <h2 className="display text-[28px] md:text-[38px]">{settings.salonName}</h2>
            <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
              Фрея — небольшая студия, где за смену не бывает потока. Один клиент — одно кресло — всё внимание.
              Здесь нет музыки на всю громкость и продаж «в нагрузку»: есть кофе, спокойный разговор и работа с
              волосами.
            </p>
            <ul className="mt-8 space-y-3 text-[15px]">
              <li className="flex gap-3">
                <span className="text-muted">Адрес</span>
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-muted">Часы</span>
                <span>{settings.hours}</span>
              </li>
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/booking" className="btn btn-primary">
                Записаться на приём
              </Link>
              <Link href="/contacts" className="btn btn-outline">
                Как добраться
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <WorkPhotos
              fit="contain"
              sizes="(max-width: 768px) 50vw, 22vw"
              className="aspect-[2/3] rounded-card"
            />
            <SitePhoto
              src={PHOTOS.still2.src}
              alt={PHOTOS.still2.alt}
              sizes="(max-width: 768px) 50vw, 28vw"
              className="mt-8 aspect-[3/4] rounded-card"
              objectPosition="center"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-[28px] leading-none">{value}</dt>
      <dd className="mt-2 text-[13px] leading-snug text-muted">{label}</dd>
    </div>
  );
}
