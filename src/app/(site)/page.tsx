import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Placeholder } from "@/components/product-image";
import { SectionHead, Step } from "@/components/ui";
import { getFeaturedProducts, getLineCounts, getVisibleProducts } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { sortLines } from "@/lib/catalog";
import { plural } from "@/lib/format";

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
        <div className="shell grid gap-10 py-14 md:grid-cols-2 md:items-center md:gap-16 md:py-24">
          <div>
            <p className="eyebrow mb-5">Студия {settings.salonName} · Партнёр Davines</p>
            <h1 className="display text-[30px] sm:text-[42px] md:text-[62px]">{settings.heroTitle}</h1>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-soft sm:mt-6 sm:text-[16px]">{settings.heroText}</p>

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

          <Placeholder
            label="Фото студии или Кристины за работой"
            hint="Загрузите изображение в public/hero.jpg"
            className="aspect-[4/5] rounded-card md:aspect-[5/6]"
          />
        </div>
      </section>

      {/* ── Почему у Кристины ────────────────────────────── */}
      <section className="border-b border-line">
        <div className="shell grid gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
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
              t: "Ритуал, а не набор банок",
              d: "Каждый продукт в подборке решает свою задачу, и я объясняю, зачем он вам.",
            },
            {
              t: "Поддержка после покупки",
              d: "Пишите, если что-то идёт не так. Скорректируем схему без новой записи.",
            },
          ].map((item) => (
            <div key={item.t} className="lg:border-l lg:border-line lg:pl-6 lg:first:border-0 lg:first:pl-0">
              <h3 className="text-[16px]">{item.t}</h3>
              <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-ink-soft">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── О Кристине ───────────────────────────────────── */}
      <section className="section border-b border-line">
        <div className="shell grid gap-10 md:grid-cols-[0.85fr_1fr] md:items-center md:gap-16">
          <Placeholder
            label="Портрет Кристины"
            hint="public/kristina.jpg"
            className="aspect-[4/5] rounded-card"
          />
          <div>
            <p className="eyebrow mb-3">{settings.masterTitle}</p>
            <h2 className="display text-[30px] md:text-[42px]">{settings.masterName}</h2>
            <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-ink-soft md:text-[16px]">
              {settings.aboutText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-outline">
                Подробнее о Кристине
              </Link>
              <Link href="/booking" className="btn btn-soft">
                Записаться на приём
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Квиз ─────────────────────────────────────────── */}
      <section className="bg-navy text-cream">
        <div className="shell grid gap-10 py-16 md:grid-cols-[1fr_auto] md:items-center md:py-20">
          <div>
            <p className="eyebrow mb-4 text-cream/45">Подбор ухода</p>
            <h2 className="display max-w-[20ch] text-[30px] md:text-[42px]">
              Не знаете, с чего начать домашний уход?
            </h2>
            <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-cream/65">
              Пять вопросов о ваших волосах и коже головы — и я соберу ритуал из продуктов Davines под вашу задачу.
              Результат можно сразу купить или взять с собой на консультацию.
            </p>
          </div>
          <Link href="/quiz" className="btn btn-ghost-light justify-self-start md:justify-self-end">
            Пройти подбор →
          </Link>
        </div>
      </section>

      {/* ── Избранные продукты ───────────────────────────── */}
      <section className="section border-b border-line">
        <div className="shell">
          <SectionHead
            eyebrow="Продукция"
            title="Выбор Кристины"
            text="То, что чаще всего уезжает домой после консультации — и работает у большинства."
            href="/shop"
            hrefLabel="Весь каталог"
          />
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Линейки ──────────────────────────────────────── */}
      <section className="section border-b border-line">
        <div className="shell">
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
      </section>

      {/* ── Как это работает ─────────────────────────────── */}
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Как это работает" title="От запроса до ритуала" />
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            <Step
              n="01"
              title="Разбираемся с запросом"
              text="Онлайн-подбор или очная диагностика в студии: смотрим состояние длины и кожи головы."
            />
            <Step
              n="02"
              title="Собираем ритуал"
              text="Два-четыре продукта Davines, которые дополняют друг друга, а не дублируют."
            />
            <Step
              n="03"
              title="Остаюсь на связи"
              text="Через пару недель уточняю, как идёт. При необходимости меняем шаг или объём."
            />
          </div>

          <div className="mt-14 flex flex-wrap gap-3 border-t border-line pt-10">
            <Link href="/quiz" className="btn btn-primary">
              Начать подбор
            </Link>
            <Link href="/booking" className="btn btn-outline">
              Записаться к Кристине
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-[30px] leading-none">{value}</dt>
      <dd className="mt-1.5 text-[12px] tracking-[0.04em] text-muted">{label}</dd>
    </div>
  );
}
