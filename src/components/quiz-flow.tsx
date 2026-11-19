"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AddRitualButton } from "./add-to-cart";
import { ProductImage } from "./product-image";
import {
  buildRitualDetailed,
  describeAnswers,
  type QuizAnswers,
  type QuizStep,
  type ScorableProduct,
} from "@/lib/quiz";
import { rub } from "@/lib/format";

/** Ключ, по которому страница записи забирает результат подбора. */
export const QUIZ_STORAGE_KEY = "freya-quiz-v1";

const COMMENT_MAX = 500;

export function QuizFlow({
  products,
  steps,
  tagLabels,
}: {
  products: ScorableProduct[];
  steps: QuizStep[];
  tagLabels: Record<string, string>;
}) {
  /** Шаг с комментарием идёт после всех вопросов анкеты. */
  const COMMENT_STEP = steps.length;
  const TOTAL_STEPS = steps.length + 1;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const onComment = step === COMMENT_STEP;
  const current = steps[step];
  const chosen = answers[current?.id ?? ""];

  const detailed = useMemo(
    () => (done ? buildRitualDetailed(products, answers, comment, steps) : []),
    [done, products, answers, comment, steps],
  );
  const ritual = detailed.map((d) => d.product);
  const total = ritual.reduce((s, p) => s + p.price, 0);

  const finish = () => {
    setDone(true);
    try {
      const picked = buildRitualDetailed(products, answers, comment, steps);
      sessionStorage.setItem(
        QUIZ_STORAGE_KEY,
        JSON.stringify({
          summary: describeAnswers(answers, comment, steps),
          products: picked.map((d) => `${d.product.line} — ${d.product.nameEn || d.product.nameRu}`),
        }),
      );
    } catch {
      // приватный режим браузера — не страшно, просто не прикрепим протокол
    }
  };

  const choose = (value: string) => {
    setAnswers((a) => ({ ...a, [current.id]: value }));
    setStep((s) => s + 1);
  };

  const restart = () => {
    setAnswers({});
    setComment("");
    setStep(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="shell section">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-4">Подбор готов</p>
          <h2 className="display text-[30px] md:text-[40px]">
            {ritual.length} {ritual.length === 1 ? "продукт" : ritual.length < 5 ? "продукта" : "продуктов"} под ваш
            запрос
          </h2>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-ink-soft">
            Подборка собрана по вашим ответам. Это отправная точка — на консультации мы можем её скорректировать, когда
            увидим волосы вживую.
          </p>

          {detailed.some((d) => d.approximate) && (
            <p className="mt-4 max-w-[56ch] text-[13px] leading-relaxed text-muted">
              Где точного совпадения по ярлыкам нет, мы поставили ближайший по задаче продукт — он отмечен как
              «близкий вариант».
            </p>
          )}

          <ul className="mt-10 space-y-3">
            {detailed.map(({ product: p, matched, approximate, pinned }, i) => (
              <li key={p.id} className="card flex items-center gap-4 p-3 sm:gap-5 sm:p-4">
                <span className="font-display w-6 shrink-0 text-center text-[20px] text-olive">{i + 1}</span>
                <ProductImage
                  src={p.image}
                  alt={p.nameEn || p.nameRu}
                  sizes="90px"
                  bgColor={p.imageBg}
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
                  {(matched.length > 0 || approximate || pinned) && (
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Почему подходит">
                      {pinned && <li className="tag !bg-navy !text-white">Выбор Кристины</li>}
                      {approximate ? (
                        <li className="tag !bg-sand !text-muted">Близкий вариант</li>
                      ) : (
                        matched.slice(0, pinned ? 2 : 3).map((key) => (
                          <li key={key} className="tag">
                            {tagLabels[key] ?? key}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
                <p className="shrink-0 text-[15px] tabular-nums">{rub(p.price)}</p>
              </li>
            ))}
          </ul>

          <div className="card-flat mt-4 flex items-center justify-between p-4">
            <span className="text-[14px] text-ink-soft">Итого за набор</span>
            <span className="font-display text-[24px] tabular-nums">{rub(total)}</span>
          </div>

          <div className="card-flat mt-8 p-5">
            <p className="text-[15px]">Хотите проверить набор на диагностике?</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              Это стартовый уход по вашим ответам. На консультации Кристина посмотрит волосы вживую и при
              необходимости скорректирует продукты.
            </p>
            <Link href="/booking" className="btn btn-primary mt-4 w-full sm:w-auto">
              Записаться на диагностику
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            <button type="button" onClick={restart} className="btn btn-soft w-full sm:w-auto">
              Пройти заново
            </button>
          </div>

          <details className="mt-10 border-t border-line pt-6">
            <summary className="cursor-pointer text-[14px] text-ink-soft">Ваши ответы</summary>
            <ul className="mt-4 space-y-2 text-[14px] text-muted">
              {describeAnswers(answers, comment, steps).map((line) => (
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
        <div className="flex items-center gap-2" role="group" aria-label={`Шаг ${step + 1} из ${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-pill transition-colors ${i <= step ? "bg-navy" : "bg-line"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-[12px] tracking-[0.06em] text-muted">
          Шаг {step + 1} из {TOTAL_STEPS}
        </p>

        {onComment ? (
          <>
            <h2 className="display mt-8 text-[28px] md:text-[36px]">Расскажите о волосах своими словами</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Необязательно. Например: «после осветления секутся кончики, пушатся от влажности». Комментарий учтём в
              подборе и передадим Кристине вместе с ответами.
            </p>
            <label className="mt-8 block">
              <span className="field-label">Комментарий о состоянии волос</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
                rows={5}
                maxLength={COMMENT_MAX}
                placeholder="Что беспокоит, чем пользуетесь сейчас, как часто окрашиваете…"
                className="field resize-y"
              />
              <span className="mt-1.5 block text-right text-[12px] text-muted tabular-nums">
                {comment.length} / {COMMENT_MAX}
              </span>
            </label>
          </>
        ) : (
          <>
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
          </>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-soft btn-sm"
          >
            ← Назад
          </button>
          {onComment ? (
            <button type="button" onClick={finish} className="btn btn-primary btn-sm">
              {comment.trim() ? "Показать подбор" : "Пропустить и показать подбор"}
            </button>
          ) : (
            chosen && (
              <button type="button" onClick={() => setStep((s) => s + 1)} className="btn btn-primary btn-sm">
                Далее →
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
