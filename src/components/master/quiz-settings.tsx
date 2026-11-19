"use client";

import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { catalogFrom, slugifyKey, sortSeries, type CatalogEntry } from "@/lib/catalog";
import { getStoredProducts, getStoredSettings, saveStoredSettings } from "@/lib/master-store";
import {
  DEFAULT_QUIZ_STEPS,
  DEPTH_STEP_ID,
  resolveQuizSteps,
  type QuizOption,
  type QuizStep,
} from "@/lib/quiz";
import { QuizProductPicker } from "./quiz-product-picker";

/** Вес ярлыка, который ставится при включении. Существующие веса из стандартной анкеты сохраняются. */
const DEFAULT_WEIGHT = 3;

type TagField = "concerns" | "hairTypes" | "lines";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function uniqueValue(base: string, taken: string[]): string {
  const root = slugifyKey(base) || "option";
  if (!taken.includes(root)) return root;
  for (let i = 2; i < 500; i++) if (!taken.includes(`${root}-${i}`)) return `${root}-${i}`;
  return `${root}-${Date.now().toString(36)}`;
}

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(i, 1);
  next.splice(j, 0, item);
  return next;
}

function validate(steps: QuizStep[]): string | null {
  if (!steps.length) return "В анкете должен быть хотя бы один вопрос.";
  for (const [i, step] of steps.entries()) {
    if (!step.question.trim()) return `Шаг ${i + 1}: введите вопрос.`;
    if (!step.options.length) return `Шаг ${i + 1}: добавьте хотя бы один вариант ответа.`;
    for (const [j, o] of step.options.entries()) {
      if (!o.label.trim()) return `Шаг ${i + 1}, вариант ${j + 1}: введите текст ответа.`;
    }
    if (step.id === DEPTH_STEP_ID) {
      const counts = step.options.map((o) => Number(o.value));
      if (counts.some((n) => !Number.isInteger(n) || n < 1 || n > 8)) return `Шаг ${i + 1}: число продуктов — от 1 до 8.`;
      if (new Set(counts).size !== counts.length) return `Шаг ${i + 1}: число продуктов в вариантах повторяется.`;
    }
  }
  return null;
}

export function QuizSettings() {
  const settings = useMemo(() => getStoredSettings(), []);
  const catalog = useMemo(() => catalogFrom(settings), [settings]);
  const products = useMemo(() => getStoredProducts(), []);
  const productBySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const lineTags = useMemo<CatalogEntry[]>(() => {
    const lines = catalog.lines.filter((l) => products.some((p) => p.line === l));
    const series = sortSeries([...new Set(products.flatMap((p) => p.series ?? []))]);
    return [...lines, ...series].map((name) => ({ key: name, label: name }));
  }, [catalog.lines, products]);

  const [steps, setSteps] = useState<QuizStep[]>(() => clone(resolveQuizSteps(settings)));
  const [saved, setSaved] = useState<string>(() => JSON.stringify(resolveQuizSteps(settings)));
  const [openOption, setOpenOption] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(steps) !== saved;

  const patchStep = (si: number, patch: Partial<QuizStep>) =>
    setSteps((list) => list.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const patchOption = (si: number, oi: number, patch: Partial<QuizOption>) =>
    setSteps((list) =>
      list.map((s, i) => (i === si ? { ...s, options: s.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)) } : s)),
    );

  function addStep() {
    const id = uniqueValue("vopros", steps.map((s) => s.id));
    const depthIndex = steps.findIndex((s) => s.id === DEPTH_STEP_ID);
    const step: QuizStep = { id, question: "Новый вопрос", caption: "", options: [{ value: "variant-1", label: "Вариант 1" }] };
    // Новый вопрос — перед шагом «сколько продуктов», чтобы тот оставался последним.
    setSteps((list) => (depthIndex < 0 ? [...list, step] : [...list.slice(0, depthIndex), step, ...list.slice(depthIndex)]));
    setOpenOption(`${id}:0`);
  }

  function removeStep(si: number) {
    const step = steps[si];
    if (!window.confirm(`Удалить вопрос «${step.question}» со всеми вариантами?`)) return;
    setSteps((list) => list.filter((_, i) => i !== si));
  }

  function addOption(si: number) {
    const step = steps[si];
    const taken = step.options.map((o) => o.value);
    const isDepth = step.id === DEPTH_STEP_ID;
    const value = isDepth
      ? String([1, 2, 3, 4, 5, 6, 7, 8].find((n) => !taken.includes(String(n))) ?? 8)
      : uniqueValue(`variant-${step.options.length + 1}`, taken);
    const label = isDepth ? `${value} продукта` : `Вариант ${step.options.length + 1}`;
    patchStep(si, { options: [...step.options, { value, label }] });
    setOpenOption(`${step.id}:${step.options.length}`);
  }

  function removeOption(si: number, oi: number) {
    const step = steps[si];
    if (step.options.length <= 1) {
      setMessage({ ok: false, text: "У вопроса должен остаться хотя бы один вариант." });
      return;
    }
    patchStep(si, { options: step.options.filter((_, j) => j !== oi) });
  }

  function toggleTag(si: number, oi: number, field: TagField, key: string) {
    const current = { ...(steps[si].options[oi][field] ?? {}) } as Record<string, number>;
    if (current[key]) delete current[key];
    else current[key] = DEFAULT_WEIGHT;
    patchOption(si, oi, { [field]: Object.keys(current).length ? current : undefined });
  }

  function save() {
    const error = validate(steps);
    if (error) {
      setMessage({ ok: false, text: error });
      return;
    }
    saveStoredSettings({ ...getStoredSettings(), quiz: { steps } });
    setSaved(JSON.stringify(steps));
    setMessage({ ok: true, text: "Анкета сохранена в браузере. Экспортируйте настройки, чтобы она появилась на сайте." });
  }

  function resetToDefault() {
    if (!window.confirm("Вернуть стандартную анкету? Ваши вопросы и выбранные продукты будут заменены.")) return;
    setSteps(clone(DEFAULT_QUIZ_STEPS));
    setMessage(null);
  }

  return (
    <div className="max-w-4xl">
      <p className="mb-6 max-w-[64ch] text-[14px] leading-relaxed text-ink-soft">
        Вопросы анкеты на странице «Подбор ухода». К каждому варианту ответа можно привязать ярлыки (эффекты, типы
        волос, линии) — по ним подбор ищет похожие продукты, — и вручную отметить продукты, которые точно подходят:
        они попадут в подбор в первую очередь с пометкой «Выбор Кристины». После вопросов клиент может оставить
        комментарий о волосах.
      </p>

      <ol className="grid gap-5">
        {steps.map((step, si) => {
          const isDepth = step.id === DEPTH_STEP_ID;
          return (
            <li key={step.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow">
                  Шаг {si + 1}
                  {isDepth ? " · сколько продуктов в подборе" : ""}
                </p>
                <div className="flex gap-1.5">
                  <button type="button" className="btn btn-soft btn-sm !px-3" disabled={si === 0} onClick={() => setSteps((l) => move(l, si, -1))} aria-label="Поднять шаг">
                    ↑
                  </button>
                  <button type="button" className="btn btn-soft btn-sm !px-3" disabled={si === steps.length - 1} onClick={() => setSteps((l) => move(l, si, 1))} aria-label="Опустить шаг">
                    ↓
                  </button>
                  {!isDepth && (
                    <button type="button" className="btn btn-outline btn-sm !px-3" onClick={() => removeStep(si)}>
                      Удалить шаг
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <label>
                  <span className="field-label">Вопрос</span>
                  <input value={step.question} onChange={(e) => patchStep(si, { question: e.target.value })} className="field" />
                </label>
                <label>
                  <span className="field-label">Пояснение под вопросом</span>
                  <input value={step.caption} onChange={(e) => patchStep(si, { caption: e.target.value })} className="field" />
                </label>
              </div>

              <p className="field-label mt-6">Варианты ответа</p>
              <ul className="grid gap-2">
                {step.options.map((option, oi) => {
                  const key = `${step.id}:${oi}`;
                  const open = openOption === key;
                  const tagCount =
                    Object.keys(option.concerns ?? {}).length +
                    Object.keys(option.hairTypes ?? {}).length +
                    Object.keys(option.lines ?? {}).length;
                  const pinned = option.products ?? [];
                  return (
                    <li key={key} className="rounded-[12px] border border-line bg-paper">
                      <div className="flex flex-wrap items-center gap-2 p-3">
                        <button
                          type="button"
                          onClick={() => setOpenOption(open ? null : key)}
                          className="min-w-0 flex-1 text-left"
                          aria-expanded={open}
                        >
                          <span className="block truncate text-[15px]">{option.label || "Без названия"}</span>
                          <span className="mt-0.5 block text-[12px] text-muted">
                            {isDepth
                              ? `${option.value} продукт(а) в подборе`
                              : `${tagCount} ярлык(ов) · ${pinned.length} продукт(ов) вручную`}
                          </span>
                        </button>
                        <div className="flex gap-1.5">
                          <button type="button" className="btn btn-soft btn-sm !px-3" disabled={oi === 0} onClick={() => patchStep(si, { options: move(step.options, oi, -1) })} aria-label="Поднять вариант">
                            ↑
                          </button>
                          <button type="button" className="btn btn-soft btn-sm !px-3" disabled={oi === step.options.length - 1} onClick={() => patchStep(si, { options: move(step.options, oi, 1) })} aria-label="Опустить вариант">
                            ↓
                          </button>
                          <button type="button" className="btn btn-soft btn-sm !px-3" onClick={() => setOpenOption(open ? null : key)}>
                            {open ? "Свернуть" : "Изменить"}
                          </button>
                          <button type="button" className="btn btn-outline btn-sm !px-3" onClick={() => removeOption(si, oi)} aria-label={`Удалить вариант «${option.label}»`}>
                            ×
                          </button>
                        </div>
                      </div>

                      {open && (
                        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label>
                              <span className="field-label">Текст ответа</span>
                              <input value={option.label} onChange={(e) => patchOption(si, oi, { label: e.target.value })} className="field" />
                            </label>
                            <label>
                              <span className="field-label">Подсказка</span>
                              <input value={option.hint ?? ""} onChange={(e) => patchOption(si, oi, { hint: e.target.value || undefined })} className="field" placeholder="Необязательно" />
                            </label>
                          </div>

                          {isDepth ? (
                            <label className="max-w-[220px]">
                              <span className="field-label">Сколько продуктов подобрать</span>
                              <select value={option.value} onChange={(e) => patchOption(si, oi, { value: e.target.value })} className="field">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                  <option key={n} value={String(n)}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : (
                            <>
                              <TagGroup
                                title="Эффекты"
                                entries={catalog.concerns}
                                selected={option.concerns ?? {}}
                                onToggle={(k) => toggleTag(si, oi, "concerns", k)}
                              />
                              <TagGroup
                                title="Типы волос"
                                entries={catalog.hairTypes}
                                selected={option.hairTypes ?? {}}
                                onToggle={(k) => toggleTag(si, oi, "hairTypes", k)}
                              />
                              <TagGroup
                                title="Линии и серии"
                                entries={lineTags}
                                selected={option.lines ?? {}}
                                onToggle={(k) => toggleTag(si, oi, "lines", k)}
                              />
                            </>
                          )}

                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="field-label !mb-0">Точно подходящие продукты ({pinned.length})</span>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setPickerFor(pickerFor === key ? null : key)}
                                aria-expanded={pickerFor === key}
                              >
                                {pickerFor === key ? "Скрыть каталог" : "Выбрать из каталога"}
                              </button>
                            </div>
                            {pinned.length > 0 && (
                              <ul className="mt-2 flex flex-wrap gap-2">
                                {pinned.map((slug) => {
                                  const p = productBySlug.get(slug);
                                  return (
                                    <li key={slug} className="flex max-w-full items-center gap-2 rounded-pill border border-line bg-paper py-1 pr-1 pl-1">
                                      {p && (
                                        <ProductImage src={p.image} alt="" sizes="28px" bgColor={p.imageBg} padding="p-0.5" className="h-7 w-7 shrink-0 rounded-full" />
                                      )}
                                      <span className="truncate text-[12px]">{p ? p.nameEn || p.nameRu : `${slug} (нет в каталоге)`}</span>
                                      <button
                                        type="button"
                                        onClick={() => patchOption(si, oi, { products: pinned.filter((s) => s !== slug) })}
                                        className="h-6 w-6 shrink-0 rounded-full text-muted hover:bg-sand hover:text-ink"
                                        aria-label="Убрать продукт"
                                      >
                                        ×
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            {pickerFor === key && (
                              <QuizProductPicker
                                products={products}
                                catalog={catalog}
                                selected={pinned}
                                onChange={(slugs) => patchOption(si, oi, { products: slugs.length ? slugs : undefined })}
                                onClose={() => setPickerFor(null)}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="btn btn-soft btn-sm mt-3" onClick={() => addOption(si)}>
                + Добавить вариант
              </button>
            </li>
          );
        })}
      </ol>

      <button type="button" className="btn btn-outline mt-5" onClick={addStep}>
        + Добавить вопрос
      </button>

      <div className="sticky bottom-0 z-10 mt-8 border-t border-line bg-paper/95 py-4 backdrop-blur-sm">
        {message && (
          <p role={message.ok ? "status" : "alert"} className={`mb-3 text-[14px] ${message.ok ? "text-olive-deep" : "text-[#a1432f]"}`}>
            {message.text}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={save} className="btn btn-primary">
            {dirty ? "Сохранить анкету" : "Сохранено"}
          </button>
          <button type="button" onClick={resetToDefault} className="btn btn-soft">
            Вернуть стандартную анкету
          </button>
        </div>
      </div>
    </div>
  );
}

function TagGroup({
  title,
  entries,
  selected,
  onToggle,
}: {
  title: string;
  entries: CatalogEntry[];
  selected: Partial<Record<string, number>>;
  onToggle: (key: string) => void;
}) {
  const count = Object.keys(selected).length;
  return (
    <details open={count > 0}>
      <summary className="field-label cursor-pointer">
        {title}
        {count ? ` · выбрано ${count}` : ""}
      </summary>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {entries.map((e) => (
          <button
            key={e.key}
            type="button"
            className="chip !min-h-[34px] !py-1.5"
            data-active={Boolean(selected[e.key])}
            aria-pressed={Boolean(selected[e.key])}
            onClick={() => onToggle(e.key)}
          >
            {e.label}
          </button>
        ))}
      </div>
    </details>
  );
}
