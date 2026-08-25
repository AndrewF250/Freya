"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { parseBookingSlots } from "@/lib/booking-slots";
import { collectBookingPayload, formatBookingMessage, buildTelegramBookingUrl, type BookingPayload } from "@/lib/booking";
import { submitBooking, type FormState } from "@/lib/forms";
import { addLead } from "@/lib/leads-store";
import { getSettings } from "@/lib/settings";
import { QUIZ_STORAGE_KEY } from "./quiz-flow";

type SavedQuiz = { summary: string[]; products: string[] };

export function BookingForm({ services }: { services: readonly string[] }) {
  const [state, setState] = useState<FormState>(null);
  const [pending, setPending] = useState(false);
  const [time, setTime] = useState("");
  const [quiz, setQuiz] = useState<SavedQuiz | null>(null);
  const [attach, setAttach] = useState(true);
  const [bookingPayload, setBookingPayload] = useState<BookingPayload | null>(null);
  const settings = getSettings();
  const slots = parseBookingSlots(settings);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.summary?.length) setQuiz(parsed);
      }
    } catch {
      // нет доступа к sessionStorage
    }
  }, []);

  const today = new Date().toISOString().slice(0, 10);

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

  function openTelegram() {
    if (!bookingPayload) return;
    const url = buildTelegramBookingUrl(settings.telegram, formatBookingMessage(bookingPayload));
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (state?.ok) {
    const telegramReady = /t\.me\/[^/?#]+/i.test(settings.telegram ?? "");

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
          <button type="button" onClick={openTelegram} className="btn btn-primary mt-8">
            Записаться в Telegram
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
    <form onSubmit={handleSubmit} className="card p-6 md:p-8" id="booking-form">
      <input type="hidden" name="time" value={time} />
      {quiz && attach && <input type="hidden" name="quiz" value={JSON.stringify(quiz)} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="field-label">Услуга *</span>
          <select name="service" required defaultValue="" className="field">
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

        <label>
          <span className="field-label">Дата *</span>
          <input type="date" name="date" required min={today} className="field" />
        </label>

        <div>
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

        <label>
          <span className="field-label">Как к вам обращаться *</span>
          <input name="name" required minLength={2} placeholder="Анна" className="field" autoComplete="name" />
        </label>

        <label>
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

        <label className="sm:col-span-2">
          <span className="field-label">E-mail</span>
          <input name="email" type="email" placeholder="anna@example.com" className="field" autoComplete="email" />
        </label>

        <label className="sm:col-span-2">
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
        <label className="card-flat mt-5 flex cursor-pointer items-start gap-3 p-4">
          <input
            type="checkbox"
            checked={attach}
            onChange={(e) => setAttach(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#1b2430]"
          />
          <span>
            <span className="block text-[14px]">Приложить результат подбора</span>
            <span className="mt-1 block text-[13px] leading-relaxed text-muted">
              Мы увидим ваши ответы и подобранный уход: {quiz.products.slice(0, 2).join(", ")}
              {quiz.products.length > 2 ? " и другие" : ""}.
            </span>
          </span>
        </label>
      )}

      {state && !state.ok && (
        <p role="alert" className="mt-5 rounded-lg border border-line bg-sand px-4 py-3 text-[14px] text-ink">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-block mt-6">
        {pending ? "Отправляю…" : "Оставить заявку"}
      </button>

      <p className="mt-4 text-center text-[12px] leading-relaxed text-muted">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных. После отправки можно сразу написать
        нам в Telegram с заполненными данными.
      </p>
    </form>
  );
}
