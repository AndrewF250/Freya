"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { parseBookingSlots } from "@/lib/booking-slots";
import { collectBookingPayload, formatBookingMessage, buildTelegramBookingUrl } from "@/lib/booking";
import { submitBooking, type FormState } from "@/lib/forms";
import { addLead } from "@/lib/leads-store";
import { getSettings } from "@/lib/settings";
import { QUIZ_STORAGE_KEY } from "./quiz-flow";

type SavedQuiz = { summary: string[]; products: string[] };
const DIAGNOSTIC_SERVICE = "Консультация и диагностика";

export function BookingForm({ services }: { services: readonly string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>(null);
  const [pending, setPending] = useState(false);
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [quiz, setQuiz] = useState<SavedQuiz | null>(null);
  const [attach, setAttach] = useState(true);
  const [bookingPayload, setBookingPayload] = useState<ReturnType<typeof collectBookingPayload> | null>(null);
  const settings = getSettings();
  const slots = parseBookingSlots(settings);
  const telegramReady = /t\.me\/[^/?#]+/i.test(settings.telegram ?? "");

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedQuiz;
      if (!parsed?.summary?.length) return;
      const id = window.setTimeout(() => {
        if (cancelled) return;
        setQuiz(parsed);
        setService((current) => current || DIAGNOSTIC_SERVICE);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    } catch {
      // нет доступа к sessionStorage
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  function openTelegramWith(payload: ReturnType<typeof collectBookingPayload>) {
    const url = buildTelegramBookingUrl(settings.telegram, formatBookingMessage(payload, settings.telegramMessagePreset));
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = e.currentTarget;
    const payload = collectBookingPayload(form);
    const result = await submitBooking(new FormData(form));

    if (result?.ok) {
      setBookingPayload(payload);
      addLead({
        kind: "booking",
        name: payload.name,
        phone: payload.phone,
        email: payload.email || undefined,
        comment: payload.comment || undefined,
        service: payload.service,
        date: payload.date,
        time: payload.time || undefined,
        quiz: payload.quiz,
      });
    }

    setState(result);
    setPending(false);
  }

  function duplicateToTelegram() {
    const form = formRef.current;
    if (!form) return;
    const payload = collectBookingPayload(form);
    if (payload.name.length < 2) {
      setState({ ok: false, message: "Укажите, как к вам обращаться." });
      return;
    }
    if (payload.phone.replace(/\D/g, "").length < 10) {
      setState({ ok: false, message: "Проверьте номер телефона — кажется, в нём не хватает цифр." });
      return;
    }
    if (!payload.service) {
      setState({ ok: false, message: "Выберите услугу." });
      return;
    }
    openTelegramWith(payload);
  }

  if (state?.ok) {
    return (
      <div className="card p-8 text-center md:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-olive-soft text-olive-deep">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="display mt-6 text-[26px]">Заявка принята</h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-soft">{state.message}</p>

        {telegramReady && (
          <button type="button" onClick={() => bookingPayload && openTelegramWith(bookingPayload)} className="btn btn-primary mt-8">
            Дублировать в Telegram
          </button>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-soft">
            Посмотреть каталог
          </Link>
          <Link href="/" className="btn btn-outline">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="card min-w-0 overflow-hidden p-5 sm:p-6 md:p-8" id="booking-form">
      <input type="hidden" name="time" value={time} />
      {quiz && attach && <input type="hidden" name="quiz" value={JSON.stringify(quiz)} />}

      <div className="grid min-w-0 gap-5">
        <label className="min-w-0">
          <span className="field-label">Услуга *</span>
          <select
            name="service"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="field"
          >
            <option value="" disabled>
              Выберите услугу
            </option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0">
          <span className="field-label">Дата *</span>
          <input type="date" name="date" required min={today} className="field" />
        </label>

        <div className="min-w-0">
          <span className="field-label">Удобное время</span>
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                className="chip"
                data-active={time === s}
                onClick={() => setTime(time === s ? "" : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <label className="min-w-0">
            <span className="field-label">Как к вам обращаться *</span>
            <input name="name" required minLength={2} placeholder="Анна" className="field" autoComplete="name" />
          </label>

          <label className="min-w-0">
            <span className="field-label">Телефон *</span>
            <input
              name="phone"
              type="tel"
              required
              placeholder="+7 (999) 123-45-67"
              className="field"
              autoComplete="tel"
            />
          </label>
        </div>

        <label className="min-w-0">
          <span className="field-label">E-mail</span>
          <input name="email" type="email" placeholder="anna@example.com" className="field" autoComplete="email" />
        </label>

        <label className="min-w-0">
          <span className="field-label">Что вас беспокоит</span>
          <textarea
            name="comment"
            rows={4}
            placeholder="Например: после осветления волосы стали ломкими, хочу разобраться с уходом"
            className="field resize-y"
          />
        </label>
      </div>

      {quiz && (
        <div className="card-flat mt-5 p-4">
          <p className="text-[14px]">Результат подбора уже приложен к заявке</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {quiz.products.slice(0, 3).join(", ")}
            {quiz.products.length > 3 ? " и другие" : ""}. На диагностике сверим его с волосами вживую.
          </p>
          <label className="mt-3 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={attach}
              onChange={(e) => setAttach(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#1b2430]"
            />
            <span className="text-[13px] text-ink-soft">Приложить ответы анкеты и подобранный уход</span>
          </label>
        </div>
      )}

      {state && !state.ok && (
        <p role="alert" className="mt-5 rounded-lg border border-line bg-sand px-4 py-3 text-[14px] text-ink">
          {state.message}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary btn-block !whitespace-normal">
          {pending ? "Отправляю…" : "Оставить заявку"}
        </button>
        {telegramReady && (
          <button type="button" onClick={duplicateToTelegram} className="btn btn-outline btn-block !whitespace-normal">
            Дублировать в Telegram
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-[12px] leading-relaxed text-muted">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных. «Дублировать в Telegram» открывает чат с
        уже заполненным текстом заявки.
      </p>
    </form>
  );
}
