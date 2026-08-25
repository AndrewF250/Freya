"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "./cart";
import { ProductImage } from "./product-image";
import { Empty } from "./ui";
import { submitOrder, type FormState } from "@/lib/forms";
import { addLead } from "@/lib/leads-store";
import { collectOrderPayload, formatOrderMessage, type OrderPayload } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { buildTelegramUrl } from "@/lib/telegram";
import { rub, plural } from "@/lib/format";

const DELIVERY = ["Доставка по Перми", "СДЭК по России"] as const;

export function CartView({ deliveryText }: { deliveryText: string }) {
  const { items, count, total, ready, setQty, remove, clear } = useCart();
  const [state, setState] = useState<FormState>(null);
  const [pending, setPending] = useState(false);
  const [orderPayload, setOrderPayload] = useState<OrderPayload | null>(null);
  const settings = getSettings();

  useEffect(() => {
    if (state?.ok) clear();
  }, [state?.ok, clear]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = collectOrderPayload(formData, items);
    const result = await submitOrder(formData);

    if (result?.ok) {
      setOrderPayload(payload);
      addLead({
        kind: "order",
        name: payload.name,
        phone: payload.phone,
        email: payload.email || undefined,
        comment: payload.comment || undefined,
        delivery: payload.delivery,
        total: payload.total,
        items: payload.items,
      });
    }

    setState(result);
    setPending(false);
  }

  function openTelegram() {
    if (!orderPayload) return;
    const url = buildTelegramUrl(settings.telegram, formatOrderMessage(orderPayload));
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (state?.ok) {
  const telegramReady = /t\.me\/[^/?#]+/i.test(settings.telegram ?? "");

    return (
      <div className="shell section">
        <div className="card mx-auto max-w-2xl p-8 text-center md:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-olive-soft text-olive-deep">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="display mt-6 text-[26px]">Заказ принят</h2>
          <p className="mx-auto mt-3 max-w-[48ch] text-[15px] leading-relaxed text-ink-soft">{state.message}</p>

          {telegramReady && (
            <button type="button" onClick={openTelegram} className="btn btn-primary mt-8">
              Оформить в Telegram
            </button>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="btn btn-soft">
              Вернуться в каталог
            </Link>
            <Link href="/booking" className="btn btn-outline">
              Записаться на приём
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="shell section min-h-[40vh]" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="shell section">
        <Empty
          title="В корзине пока пусто"
          text="Загляните в каталог или пройдите подбор — подберём уход под ваши волосы."
        >
          <Link href="/shop" className="btn btn-primary btn-sm">
            В каталог
          </Link>
          <Link href="/quiz" className="btn btn-outline btn-sm">
            Пройти подбор
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="shell section grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
      <div>
        <div className="flex items-center justify-between border-b border-line pb-4">
          <p className="text-[14px] text-muted">
            {count} {plural(count, ["позиция", "позиции", "позиций"])}
          </p>
          <button type="button" onClick={clear} className="text-[13px] text-muted transition-colors hover:text-ink">
            Очистить корзину
          </button>
        </div>

        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.slug} className="flex gap-4 py-5 sm:gap-5">
              <ProductImage
                src={item.image}
                alt={item.nameRu}
                sizes="110px"
                bgColor={item.imageBg}
                className="h-[96px] w-[96px] shrink-0 rounded-lg border border-line"
              />

              <div className="min-w-0 flex-1">
                <p className="eyebrow">{item.line}</p>
                <p className="mt-1 text-[15px] leading-snug">
                  <Link href={`/shop/${item.slug}`} className="transition-colors hover:text-olive-deep">
                    {item.nameRu}
                  </Link>
                </p>
                {item.volume && <p className="mt-0.5 text-[13px] text-muted">{item.volume}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div className="flex items-center rounded-pill border border-line bg-paper">
                    <button
                      type="button"
                      onClick={() => setQty(item.slug, item.qty - 1)}
                      className="h-8 w-8 rounded-pill text-ink-soft transition-colors hover:text-ink"
                      aria-label={`Уменьшить количество «${item.nameRu}»`}
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-[14px] tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.slug, item.qty + 1)}
                      className="h-8 w-8 rounded-pill text-ink-soft transition-colors hover:text-ink"
                      aria-label={`Увеличить количество «${item.nameRu}»`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    className="text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-[15px] tabular-nums">{rub(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-[92px] lg:self-start">
        <form onSubmit={handleSubmit} className="card p-6">
          <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ slug: i.slug, qty: i.qty })))} />

          <div className="flex items-baseline justify-between border-b border-line pb-5">
            <span className="text-[15px]">Итого</span>
            <span className="font-display text-[28px] tabular-nums">{rub(total)}</span>
          </div>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="field-label">Как получить *</span>
              <select name="delivery" required defaultValue={DELIVERY[0]} className="field">
                {DELIVERY.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="field-label">Имя *</span>
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

            <label>
              <span className="field-label">E-mail</span>
              <input name="email" type="email" placeholder="anna@example.com" className="field" autoComplete="email" />
            </label>

            <label>
              <span className="field-label">Комментарий</span>
              <textarea name="comment" rows={3} placeholder="Адрес доставки или удобное время" className="field resize-y" />
            </label>
          </div>

          {state && !state.ok && (
            <p role="alert" className="mt-5 rounded-lg border border-line bg-sand px-4 py-3 text-[14px]">
              {state.message}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn btn-primary btn-block mt-6">
            {pending ? "Отправляю…" : "Оформить заказ"}
          </button>

          <p className="mt-4 text-[12px] leading-relaxed text-muted">{deliveryText}</p>
          <ul className="mt-4 space-y-2 text-[12px] leading-relaxed text-muted">
            <li>· Оригинальный Davines от официального дистрибьютора</li>
            <li>· Подтверждение заказа в Telegram в течение рабочего дня</li>
            <li>· Доставка по Перми и СДЭК по России</li>
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            Оплата не проводится на сайте: мы подтвердим наличие и пришлём способ оплаты.
          </p>
        </form>
      </aside>
    </div>
  );
}
