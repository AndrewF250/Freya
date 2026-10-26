"use client";

import { useState } from "react";
import {
  uniqueCatalogKey,
  type CatalogEntry,
} from "@/lib/catalog";
import { getStoredProducts } from "@/lib/master-store";

export function CatalogEntriesEditor({
  title,
  hint,
  entries,
  usedKeys,
  onChange,
}: {
  title: string;
  hint: string;
  entries: CatalogEntry[];
  usedKeys: (key: string) => number;
  onChange: (entries: CatalogEntry[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function add() {
    const label = draft.trim();
    if (label.length < 2) {
      setError("Введите название — минимум 2 символа.");
      return;
    }
    if (entries.some((e) => e.label.toLowerCase() === label.toLowerCase())) {
      setError("Такая запись уже есть.");
      return;
    }
    setError("");
    setDraft("");
    onChange([...entries, { key: uniqueCatalogKey(label, entries), label }]);
  }

  function rename(key: string, label: string) {
    onChange(entries.map((e) => (e.key === key ? { ...e, label } : e)));
  }

  function remove(key: string) {
    const used = usedKeys(key);
    if (used > 0) {
      setError(`Нельзя удалить: на этом значении ${used} товар(ов). Сначала снимите тег с товаров.`);
      return;
    }
    onChange(entries.filter((e) => e.key !== key));
  }

  function move(key: string, dir: -1 | 1) {
    const i = entries.findIndex((e) => e.key === key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= entries.length) return;
    const next = [...entries];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item);
    onChange(next);
  }

  return (
    <fieldset className="card mb-5 p-6">
      <legend className="eyebrow mb-1">{title}</legend>
      <p className="mb-5 text-[13px] leading-relaxed text-muted">{hint}</p>

      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
        {entries.map((entry, i) => (
          <li key={entry.key} className="flex flex-wrap items-center gap-2 p-3 sm:flex-nowrap">
            <input
              value={entry.label}
              onChange={(e) => rename(entry.key, e.target.value)}
              className="field min-w-0 flex-1 !py-2"
            />
            <span className="text-[12px] text-muted">{usedKeys(entry.key)}</span>
            <button type="button" className="btn btn-soft btn-sm !px-3" onClick={() => move(entry.key, -1)} disabled={i === 0}>
              ↑
            </button>
            <button
              type="button"
              className="btn btn-soft btn-sm !px-3"
              onClick={() => move(entry.key, 1)}
              disabled={i === entries.length - 1}
            >
              ↓
            </button>
            <button type="button" className="btn btn-outline btn-sm !px-3" onClick={() => remove(entry.key)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1">
          <span className="field-label">Добавить</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="field"
            placeholder="Новое значение"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
        </label>
        <button type="button" className="btn btn-soft btn-sm" onClick={add}>
          Добавить
        </button>
      </div>
      {error && <p className="mt-3 text-[13px] text-olive-deep">{error}</p>}
    </fieldset>
  );
}

export function LinesEditor({
  lines,
  onChange,
}: {
  lines: string[];
  onChange: (lines: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const products = typeof window === "undefined" ? [] : getStoredProducts();

  function used(line: string) {
    return products.filter((p) => p.line === line).length;
  }

  function add() {
    const label = draft.trim();
    if (label.length < 2) {
      setError("Введите название линейки.");
      return;
    }
    if (lines.some((l) => l.toLowerCase() === label.toLowerCase())) {
      setError("Такая линейка уже есть.");
      return;
    }
    setError("");
    setDraft("");
    onChange([...lines, label]);
  }

  function rename(from: string, to: string) {
    onChange(lines.map((l) => (l === from ? to : l)));
  }

  function remove(line: string) {
    if (used(line) > 0) {
      setError(`Нельзя удалить «${line}»: есть товары в этой линейке.`);
      return;
    }
    onChange(lines.filter((l) => l !== line));
  }

  function move(line: string, dir: -1 | 1) {
    const i = lines.indexOf(line);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= lines.length) return;
    const next = [...lines];
    const [item] = next.splice(i, 1);
    next.splice(j, 0, item);
    onChange(next);
  }

  return (
    <fieldset className="card mb-5 p-6">
      <legend className="eyebrow mb-1">Линейки</legend>
      <p className="mb-5 text-[13px] leading-relaxed text-muted">
        Порядок в фильтрах каталога и на главной. Новую линейку можно добавить здесь или прямо в карточке товара.
      </p>

      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
        {lines.map((line, i) => (
          <li key={`${line}-${i}`} className="flex flex-wrap items-center gap-2 p-3 sm:flex-nowrap">
            <input
              value={line}
              onChange={(e) => rename(line, e.target.value)}
              className="field min-w-0 flex-1 !py-2"
            />
            <span className="text-[12px] text-muted">{used(line)}</span>
            <button type="button" className="btn btn-soft btn-sm !px-3" onClick={() => move(line, -1)} disabled={i === 0}>
              ↑
            </button>
            <button
              type="button"
              className="btn btn-soft btn-sm !px-3"
              onClick={() => move(line, 1)}
              disabled={i === lines.length - 1}
            >
              ↓
            </button>
            <button type="button" className="btn btn-outline btn-sm !px-3" onClick={() => remove(line)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1">
          <span className="field-label">Добавить линейку</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="field"
            placeholder="MoMo"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
        </label>
        <button type="button" className="btn btn-soft btn-sm" onClick={add}>
          Добавить
        </button>
      </div>
      {error && <p className="mt-3 text-[13px] text-olive-deep">{error}</p>}
    </fieldset>
  );
}
