"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AddRitualButton } from "./add-to-cart";
import { ProductImage } from "./product-image";
import { QUIZ_STEPS, buildRitual, describeAnswers, type QuizAnswers, type ScorableProduct } from "@/lib/quiz";
import { rub } from "@/lib/format";

/** Ключ, по которому страница записи забирает результат подбора. */
export const QUIZ_STORAGE_KEY = "freya-quiz-v1";

export function QuizFlow({ products }: { products: ScorableProduct[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [done, setDone] = useState(false);

  const current = QUIZ_STEPS[step];
  const chosen = answers[current?.id ?? ""];
  const isLast = step === QUIZ_STEPS.length - 1;

  const ritual = useMemo(() => (done ? buildRitual(products, answers) : []), [done, products, answers]);
  const total = ritual.reduce((s, p) => s + p.price, 0);

  const finish = (finalAnswers: QuizAnswers) => {
    setDone(true);
    try {
      const picked = buildRitual(products, finalAnswers);
      sessionStorage.setItem(
        QUIZ_STORAGE_KEY,
        JSON.stringify({
          summary: describeAnswers(finalAnswers),
          products: picked.map((p) => `${p.line} — ${p.nameEn || p.nameRu}`),
        }),
      );
    } catch {
      // приватный режим браузера — не страшно, просто не прикрепим протокол
    }
  };

  const choose = (value: string) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (isLast) finish(next);
    else setStep((s) => s + 1);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="shell section">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-4">Ваш ритуал готов</p>
          <h2 className="display text-[30px] md:text-[40px]">
            {ritual.length} {ritual.length === 1 ? "продукт" : ritual.length < 5 ? "продукта" : "продуктов"} под ваш
            запрос
          </h2>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-ink-soft">
            Подборка собрана по вашим ответам. Это отправная точка — на консультации я могу её скорректировать, когда
            увижу волосы вживую.
          </p>

          <ul className="mt-10 space-y-3">
            {ritual.map((p, i) => (
              <li key={p.id} className="card flex items-center gap-4 p-3 sm:gap-5 sm:p-4">
                <span className="font-display w-6 shrink-0 text-center text-[20px] text-olive">{i + 1}</span>
                <ProductImage
                  src={p.image}
                  alt={p.nameEn || p.nameRu}
                  sizes="90px"
                  className="h-[76px] w-[76px] shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">{p.line}</p>
                  <p className="mt-1 truncate text-[15px]">
                    <Link href={`/shop/${p.slug}`} className="transition-colors hover:text-olive-deep">
                      {p.nameEn || p.nameRu}
                    </Link>
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-muted">{p.nameRu}</p>
                </div>
                <p className="shrink-0 text-[15px] tabular-nums">{rub(p.price)}</p>
              </li>
            ))}
          </ul>

          <div className="card-flat mt-4 flex items-center justify-between p-4">
            <span className="text-[14px] text-ink-soft">Стоимость ритуала</span>
            <span className="font-display text-[24px] tabular-nums">{rub(total)}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <AddRitualButton
              products={ritual.map((p) => ({
                slug: p.slug,
                nameRu: p.nameRu,
                line: p.line,
                volume: p.volume,
                price: p.price,
                image: p.image,
              }))}
              label="Добавить в корзину"
            />
            <Link href="/booking" className="btn btn-outline">
              Записаться с подбором
            </Link>
            <button type="button" onClick={restart} className="btn btn-soft">
              Пройти заново
            </button>
          </div>

          <details className="mt-10 border-t border-line pt-6">
            <summary className="cursor-pointer text-[14px] text-ink-soft">Ваши ответы</summary>
            <ul className="mt-4 space-y-2 text-[14px] text-muted">
              {describeAnswers(answers).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="shell section">
      <div className="mx-auto max-w-2xl">
        {/* Прогресс */}
        <div className="flex items-center gap-2" role="group" aria-label={`Шаг ${step + 1} из ${QUIZ_STEPS.length}`}>
          {QUIZ_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-[3px] flex-1 rounded-pill transition-colors ${i <= step ? "bg-navy" : "bg-line"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-[12px] tracking-[0.06em] text-muted">
          Шаг {step + 1} из {QUIZ_STEPS.length}
        </p>

        <h2 className="display mt-8 text-[28px] md:text-[36px]">{current.question}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{current.caption}</p>

        <div className="mt-8 grid gap-3">
          {current.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => choose(opt.value)}
              className={`card px-5 py-4 text-left transition-colors hover:border-navy ${
                chosen === opt.value ? "border-navy" : ""
              }`}
            >
              <span className="block text-[16px]">{opt.label}</span>
              {opt.hint && <span className="mt-1 block text-[13px] leading-snug text-muted">{opt.hint}</span>}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-soft btn-sm"
          >
            ← Назад
          </button>
          {chosen && (
            <button
              type="button"
              onClick={() => (isLast ? finish(answers) : setStep((s) => s + 1))}
              className="btn btn-primary btn-sm"
            >
              {isLast ? "Показать ритуал" : "Далее →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
