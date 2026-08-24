"use client";

import { useMemo, useState } from "react";
import {
  deleteLead,
  getLeads,
  markLeadDone,
  restoreLead,
  type Lead,
  type LeadKind,
} from "@/lib/leads-store";
import { formatDate, rub, plural } from "@/lib/format";

type KindFilter = "all" | LeadKind;
type DateMode = "all" | "single" | "range";

function leadDateKey(lead: Lead): string {
  if (lead.kind === "booking" && lead.date) return lead.date;
  return lead.createdAt.slice(0, 10);
}

function formatDay(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function matchesDateFilter(lead: Lead, mode: DateMode, single: string, from: string, to: string): boolean {
  if (mode === "all") return true;
  const key = leadDateKey(lead);
  if (mode === "single" && single) return key === single;
  if (mode === "range") {
    if (from && key < from) return false;
    if (to && key > to) return false;
    return Boolean(from || to);
  }
  return true;
}

function kindLabel(kind: LeadKind) {
  return kind === "order" ? "Заказ" : "Запись";
}

export function MasterLeadsList({ onChange }: { onChange: () => void }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [dateMode, setDateMode] = useState<DateMode>("all");
  const [singleDate, setSingleDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const leads = getLeads();

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (kind !== "all" && lead.kind !== kind) return false;
      return matchesDateFilter(lead, dateMode, singleDate, fromDate, toDate);
    });
  }, [leads, kind, dateMode, singleDate, fromDate, toDate]);

  function handleDone(id: string) {
    markLeadDone(id);
    onChange();
  }

  function handleRestore(id: string) {
    restoreLead(id);
    onChange();
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Удалить заявку от «${name}»? Это действие нельзя отменить.`)) return;
    deleteLead(id);
    onChange();
  }

  return (
    <>
      <div className="card mb-5 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr]">
        <label>
          <span className="field-label">Тип</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as KindFilter)} className="field !w-auto min-w-[140px]">
            <option value="all">Все</option>
            <option value="booking">Записи</option>
            <option value="order">Заказы</option>
          </select>
        </label>

        <label>
          <span className="field-label">Дата</span>
          <select value={dateMode} onChange={(e) => setDateMode(e.target.value as DateMode)} className="field !w-auto min-w-[160px]">
            <option value="all">Все даты</option>
            <option value="single">Одна дата</option>
            <option value="range">Диапазон</option>
          </select>
        </label>

        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-1">
          {dateMode === "single" && (
            <label className="min-w-[160px] flex-1">
              <span className="field-label">День</span>
              <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} className="field" />
            </label>
          )}
          {dateMode === "range" && (
            <>
              <label className="min-w-[140px] flex-1">
                <span className="field-label">С</span>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="field" />
              </label>
              <label className="min-w-[140px] flex-1">
                <span className="field-label">По</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="field" />
              </label>
            </>
          )}
          <p className="pb-3 text-[13px] text-muted">
            {filtered.length} {plural(filtered.length, ["заявка", "заявки", "заявок"])}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-[16px]">Заявок пока нет</p>
          <p className="mt-2 text-[14px] text-muted">
            Они появятся после отправки формы заказа или записи на сайте.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDone={() => handleDone(lead.id)}
              onRestore={() => handleRestore(lead.id)}
              onDelete={() => handleDelete(lead.id, lead.name)}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function LeadCard({
  lead,
  onDone,
  onRestore,
  onDelete,
}: {
  lead: Lead;
  onDone: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const done = lead.status === "done";

  return (
    <li
      className={`card flex flex-wrap items-start gap-4 p-5 transition-opacity ${done ? "opacity-55" : ""}`}
      data-done={done}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge">{kindLabel(lead.kind)}</span>
          {done && <span className="text-[12px] text-muted">Обработано</span>}
          <span className="text-[12px] text-muted">{formatDate(lead.createdAt)}</span>
        </div>

        <p className="mt-2 text-[16px] font-medium">{lead.name}</p>
        <p className="mt-0.5 text-[14px] text-ink-soft">
          <a href={`tel:${lead.phone}`} className="hover:text-ink">
            {lead.phone}
          </a>
          {lead.email && (
            <>
              {" · "}
              <a href={`mailto:${lead.email}`} className="hover:text-ink">
                {lead.email}
              </a>
            </>
          )}
        </p>

        {lead.kind === "booking" && (
          <p className="mt-2 text-[14px]">
            {lead.service}
            {lead.date && (
              <>
                {" · "}
                {formatDay(lead.date)}
                {lead.time ? ` в ${lead.time}` : ""}
              </>
            )}
          </p>
        )}

        {lead.kind === "order" && (
          <>
            {lead.delivery && <p className="mt-2 text-[14px]">{lead.delivery}</p>}
            {lead.items && lead.items.length > 0 && (
              <ul className="mt-2 space-y-1 text-[13px] text-ink-soft">
                {lead.items.map((item) => (
                  <li key={item.slug}>
                    {item.name} × {item.qty} — {rub(item.price * item.qty)}
                  </li>
                ))}
              </ul>
            )}
            {lead.total != null && <p className="mt-2 text-[14px] font-medium">Итого: {rub(lead.total)}</p>}
          </>
        )}

        {lead.comment && <p className="mt-2 text-[13px] text-muted">{lead.comment}</p>}

        {lead.quiz && (lead.quiz.summary.length > 0 || lead.quiz.products.length > 0) && (
          <div className="mt-3 rounded-lg border border-line bg-sand/60 px-3 py-2 text-[12px] text-ink-soft">
            {lead.quiz.summary.length > 0 && (
              <p className="mb-1">
                Подбор: {lead.quiz.summary.slice(0, 2).join("; ")}
                {lead.quiz.summary.length > 2 ? "…" : ""}
              </p>
            )}
            {lead.quiz.products.length > 0 && (
              <p>Уход: {lead.quiz.products.slice(0, 3).join(", ")}
                {lead.quiz.products.length > 3 ? "…" : ""}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        {done ? (
          <button type="button" onClick={onRestore} className="btn btn-soft btn-sm" title="Восстановить">
            Восстановить
          </button>
        ) : (
          <button
            type="button"
            onClick={onDone}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-paper text-olive-deep transition-colors hover:bg-olive-soft"
            title="Отметить обработанным"
            aria-label="Отметить обработанным"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-paper text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          title="Удалить"
          aria-label="Удалить"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </li>
  );
}
