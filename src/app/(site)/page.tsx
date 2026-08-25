import Link from "next/link";
import type { Metadata } from "next";
import { PhotoBackdrop } from "@/components/photo-backdrop";
import { ProductCard } from "@/components/product-card";
import { SitePhoto } from "@/components/site-photo";
import { WorkPhotos } from "@/components/work-photos";
import { SectionHead, Step } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { getFeaturedProducts, getLineCounts, getVisibleProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { sortLines } from "@/lib/catalog";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Салон ФРЕЯ — Davines в Перми",
  description:
    "Салон ФРЕЯ в Перми: оригинальный Davines, подбор домашнего ухода за минуту, запись в салон и доставка по Перми и России.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const settings = getSettings();
  const featured = getFeaturedProducts(8);
  const lineRows = getLineCounts();
  const total = getVisibleProducts().length;

  const lines = sortLines(lineRows.map((r) => r.line)).map((line) => ({
    line,
    count: lineRows.find((r) => r.line === line)?.count ?? 0,
  }));

  return (
    <>
      {/* ── Первый экран ─────────────────────────────────── */}
      <section className="border-b border-line bg-sand">
        <div className="shell grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.7fr)] md:gap-10 md:py-14 lg:gap-14 lg:py-16 xl:gap-16 xl:py-20">
          <div>
            <p className="eyebrow mb-5">Студия {settings.salonName} · Партнёр Davines</p>
            <h1 className="display text-[30px] sm:text-[42px] md:text-[52px] xl:text-[64px]">{settings.heroTitle}</h1>
            <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-ink-soft sm:mt-6 sm:text-[16px] xl:max-w-[52ch]">
              {settings.heroText}
            </p>
            <p className="mt-4 text-[13px] tracking-[0.04em] text-muted">
              Диагностика · оригинал Davines · доставка по Перми
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
              <Link href="/quiz" className="btn btn-primary w-full sm:w-auto">
                Подобрать уход за 1 минуту
              </Link>
              <Link href="/shop" className="btn btn-outline w-full sm:w-auto">
                Каталог Davines
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6 sm:mt-12 sm:gap-6 sm:pt-7">
              <Stat value={String(total)} label={plural(total, ["продукт", "продукта", "продуктов"])} />
              <Stat value={String(lines.length)} label={plural(lines.length, ["линейка", "линейки", "линеек"])} />
              <Stat value="10+" label="лет практики" />
            </dl>
          </div>

          <WorkPhotos
            priority
            fit="contain"
            sizes="(max-width: 768px) 70vw, 26vw"
            className="mx-auto aspect-[2/3] w-full max-w-[240px] rounded-card sm:max-w-[280px] md:mx-0 md:max-w-[320px] lg:max-w-[360px]"
          />
        </div>
      </section>

      {/* ── Почему к нам ─────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="shell grid gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10 xl:py-16">
          {[
            {
              t: "Диагностика до покупки",
              d: "Сначала смотрим на волосы и кожу головы, потом собираем уход. Не наоборот.",
            },
            {
              t: "Только оригинал Davines",
              d: "Продукция от официального дистрибьютора. Свежие партии, честные сроки годности.",
            },
            {
              t: "Уход, а не набор банок",
              d: "Каждый продукт в подборке решает свою задачу — и мы объясняем, зачем он вам.",
            },
            {
              t: "Подбор при покупке",
              d: "Подбор домашнего ухода бесплатно, если берёте продукты в салоне после консультации.",
            },
          ].map((item) => (
            <div key={item.t} className="lg:border-l lg:border-line lg:pl-6 lg:first:border-0 lg:first:pl-0">
              <h3 className="text-[16px]">{item.t}</h3>
              <p className="mt-2 max-w-[38ch] text-[14px] leading-relaxed text-ink-soft">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Мастер и студия ──────────────────────────────── */}
      <section className="section border-b border-line">
        <div className="shell grid gap-10 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.15fr)] md:items-center lg:gap-16 xl:gap-20">
          <SitePhoto
            src={PHOTOS.portrait.src}
            alt={PHOTOS.portrait.alt}
            fit="contain"
            sizes="(max-width: 768px) 70vw, 28vw"
            className="mx-auto aspect-[3/4] w-full max-w-[280px] rounded-card sm:max-w-[320px] md:mx-0 md:max-w-[360px] lg:max-w-[400px]"
          />
          <div>
            <p className="eyebrow mb-3">{settings.masterTitle}</p>
            <h2 className="display text-[30px] md:text-[42px] xl:text-[48px]">{settings.masterName}</h2>
            <p className="mt-6 max-w-[54ch] text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
              {settings.aboutText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-outline">
                О студии и мастере
              </Link>
              <Link href="/booking" className="btn btn-soft">
                Записаться на приём
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Квиз ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-cream">
        <PhotoBackdrop
          src={PHOTOS.catLeaveIn.src}
          tone="navy"
          photoClassName="opacity-35"
          widthClass="w-[48%]"
          sizes="48vw"
        />
        <div className="shell relative grid gap-10 py-16 md:grid-cols-[1fr_auto] md:items-center md:py-20 xl:py-24">
          <div>
            <p className="eyebrow mb-4 text-cream/45">Подбор ухода</p>
            <h2 className="display max-w-[20ch] text-[30px] md:text-[42px] xl:text-[48px]">
              Не знаете, с чего начать домашний уход?
            </h2>
            <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-cream/65">
              Пять вопросов о ваших волосах и коже головы — и мы подберём уход из продуктов Davines под вашу
              задачу. Результат можно сразу купить или взять с собой на консультацию.
            </p>
          </div>
          <Link href="/quiz" className="btn btn-ghost-light justify-self-start md:justify-self-end">
            Пройти подбор →
          </Link>
        </div>
      </section>

      {/* ── Избранные продукты ───────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line bg-sand">
        <PhotoBackdrop src={PHOTOS.catMask.src} tone="sand" photoClassName="opacity-50" widthClass="w-[44%]" />
        <div className="shell relative section">
          <SectionHead
            eyebrow="Продукция"
            title="Что чаще уезжает домой"
            text="То, что чаще всего уезжает домой после консультации — и работает у большинства."
            href="/shop"
            hrefLabel="Весь каталог"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:gap-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Линейки ──────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <PhotoBackdrop
          src={PHOTOS.catConditioner.src}
          tone="cream"
          photoClassName="opacity-45"
          widthClass="w-[46%] xl:w-[50%]"
        />
        <div className="shell relative section grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <SectionHead
              eyebrow="Davines"
              title="Линейки под конкретную задачу"
              text="У каждой линейки свой ключевой ингредиент и своя работа. Выбирайте по запросу, а не по красивой банке."
            />
            <div className="mt-10 flex flex-wrap gap-2.5">
              {lines.map(({ line, count }) => (
                <Link
                  key={line}
                  href={`/shop?line=${encodeURIComponent(line)}`}
                  className="chip !px-4 !py-2.5 !text-[13px] hover:!border-navy"
                >
                  {line}
                  <span className="text-muted">{count}</span>
                </Link>
              ))}
            </div>
          </div>
          <SitePhoto
            src={PHOTOS.still1.src}
            alt={PHOTOS.still1.alt}
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="relative z-[1] aspect-[3/2] rounded-card"
          />
        </div>
      </section>

      {/* ── Как это работает ─────────────────────────────── */}
      <section className="section">
        <div className="shell grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <SitePhoto
            src={PHOTOS.towel.src}
            alt={PHOTOS.towel.alt}
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="aspect-[3/2] rounded-card lg:sticky lg:top-[92px] lg:aspect-[4/5]"
            objectPosition="center 40%"
          />
          <div>
            <SectionHead eyebrow="Как это работает" title="От запроса до результата" />
            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              <Step
                n="01"
                title="Разбираемся с запросом"
                text="Онлайн-подбор или очная диагностика в студии: смотрим состояние длины и кожи головы."
              />
              <Step
                n="02"
                title="Собираем уход"
                text="Два-четыре продукта Davines, которые дополняют друг друга, а не дублируют."
              />
              <Step
                n="03"
                title="Остаёмся на связи"
                text="Через пару недель уточняем, как идёт. При необходимости меняем шаг или объём."
              />
            </div>

            <div className="mt-14 flex flex-wrap gap-3 border-t border-line pt-10">
              <Link href="/quiz" className="btn btn-primary">
                Начать подбор
              </Link>
              <Link href="/booking" className="btn btn-outline">
                Записаться в салон
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-[30px] leading-none xl:text-[36px]">{value}</dt>
      <dd className="mt-1.5 text-[12px] tracking-[0.04em] text-muted">{label}</dd>
    </div>
  );
}
