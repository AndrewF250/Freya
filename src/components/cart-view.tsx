"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "./cart";
import { ProductImage } from "./product-image";
import { Empty } from "./ui";
import { FieldError, fieldProps } from "./field-error";
import { submitOrder, type FormState } from "@/lib/forms";
import { addLead } from "@/lib/leads-store";
import { collectOrderPayload, formatOrderMessage, type OrderPayload } from "@/lib/orders";
import {
  PAYMENT_METHODS,
  createPayment,
  isOnlinePaymentEnabled,
  newOrderId,
  type PaymentMethod,
} from "@/lib/payments";
import { getSettings } from "@/lib/settings";
import { buildTelegramUrl } from "@/lib/telegram";
import { DELIVERY_OPTIONS, LIMITS, firstError, formatPhone, validateOrder, type FieldErrors } from "@/lib/validation";
import { rub, plural } from "@/lib/format";

export function CartView({ deliveryText }: { deliveryText: string }) {
  const { items, count, total, ready, setQty, remove, clear } = useCart();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [orderPayload, setOrderPayload] = useState<OrderPayload | null>(null);
  const [orderId, setOrderId] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("on-confirm");
  const settings = getSettings();
  const telegramReady = /t\.me\/[^/?#]+/i.test(settings.telegram ?? "");
  const onlinePayment = isOnlinePaymentEnabled();
  const paymentReturn = searchParams.get("payment") === "return" ? searchParams.get("order") : null;

  // Номер заказа создаём на клиенте после монтирования, чтобы не расходилась разметка сервера и клиента.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOrderId(newOrderId());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (state?.ok) clear();
  }, [state?.ok, clear]);

  function readForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const input = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      delivery: String(formData.get("delivery") ?? ""),
      address: String(formData.get("address") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
    };
    return { formData, input, errors: validateOrder(input) };
  }

  /** Проверяет форму и показывает ошибки под полями. Возвращает данные, если всё в порядке. */
  function validate() {
    const form = formRef.current;
    if (!form) return null;
    const result = readForm(form);
    setErrors(result.errors);
    const message = firstError(result.errors);
    if (message) {
      setState({ ok: false, message: "Проверьте выделенные поля." });
      const field = Object.keys(result.errors)[0];
      form.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
      return null;
    }
    setState(null);
    return result;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const checked = validate();
    if (!checked) return;
    setPending(true);
    const payload = collectOrderPayload(checked.formData, items);
    const result = await submitOrder(checked.formData);

    if (result?.ok) {
      setOrderPayload(payload);
      addLead({
        kind: "order",
        name: payload.name,
        phone: payload.phone,
        email: payload.email || undefined,
        comment: [payload.address && `Адрес: ${payload.address}`, payload.payment && `Оплата: ${payload.payment}`, payload.comment]
          .filter(Boolean)
          .join("\n") || undefined,
        delivery: payload.delivery,
        total: payload.total,
        items: payload.items,
      });

      if (payment === "yookassa" && onlinePayment) {
        const paid = await createPayment(payload);
        if (paid.ok) {
          clear();
          window.location.assign(paid.confirmationUrl);
          return;
        }
        setState({
          ok: true,
          message: `${result.message} Онлайн-оплата сейчас недоступна (${paid.message}) — пришлём способ оплаты вместе с подтверждением.`,
        });
        setPending(false);
        return;
      }
    }

    setState(result);
    setPending(false);
  }

  function openTelegramWith(payload: OrderPayload) {
    const url = buildTelegramUrl(settings.telegram, formatOrderMessage(payload));
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  /** «Отправить в Telegram»: проверяем поля и открываем чат с готовым текстом заказа. */
  function sendToTelegram() {
    const checked = validate();
    if (!checked) return;
    openTelegramWith(collectOrderPayload(checked.formData, items));
  }

  if (paymentReturn) {
    return (
      <div className="shell section">
        <div className="card mx-auto max-w-2xl p-8 text-center md:p-12">
          <h2 className="display text-[26px]">Спасибо за заказ {paymentReturn}</h2>
          <p className="mx-auto mt-3 max-w-[48ch] text-[15px] leading-relaxed text-ink-soft">
            Если оплата прошла, ЮKassa пришлёт чек на телефон или почту. Мы проверим платёж и свяжемся, чтобы
            согласовать доставку.
          </p>
          <Link href="/shop" className="btn btn-soft mt-8">
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  if (state?.ok) {
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

          {telegramReady && orderPayload && (
            <button type="button" onClick={() => openTelegramWith(orderPayload)} className="btn btn-primary mt-8">
              Дублировать в Telegram
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

  const paymentLabel = PAYMENT_METHODS.find((m) => m.key === payment)?.label ?? "";

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
                      disabled={item.qty >= LIMITS.qty}
                      className="h-8 w-8 rounded-pill text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
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
        <FieldError id="items" message={errors.items} />
      </div>

      <aside className="lg:sticky lg:top-[92px] lg:self-start">
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="card p-6">
          <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ slug: i.slug, qty: i.qty })))} />
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="paymentLabel" value={paymentLabel} />

          <div className="flex items-baseline justify-between border-b border-line pb-5">
            <span className="text-[15px]">Итого</span>
            <span className="font-display text-[28px] tabular-nums">{rub(total)}</span>
          </div>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="field-label">Как получить *</span>
              <select name="delivery" required defaultValue={DELIVERY_OPTIONS[0]} className="field" {...fieldProps("delivery", errors)}>
                {DELIVERY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <FieldError id="delivery" message={errors.delivery} />
            </label>

            <label>
              <span className="field-label">Адрес доставки *</span>
              <input
                name="address"
                required
                maxLength={LIMITS.address}
                placeholder="Пермь, ул. Ленина, 10, кв. 5"
                className="field"
                autoComplete="street-address"
                {...fieldProps("address", errors)}
              />
              <FieldError id="address" message={errors.address} />
            </label>

            <label>
              <span className="field-label">Имя *</span>
              <input
                name="name"
                required
                minLength={2}
                maxLength={LIMITS.name}
                placeholder="Анна"
                className="field"
                autoComplete="name"
                {...fieldProps("name", errors)}
              />
              <FieldError id="name" message={errors.name} />
            </label>

            <label>
              <span className="field-label">Телефон *</span>
              <input
                name="phone"
                type="tel"
                required
                inputMode="tel"
                placeholder="+7 (999) 123-45-67"
                className="field"
                autoComplete="tel"
                onBlur={(e) => {
                  e.currentTarget.value = formatPhone(e.currentTarget.value);
                }}
                {...fieldProps("phone", errors)}
              />
              <FieldError id="phone" message={errors.phone} />
            </label>

            <label>
              <span className="field-label">E-mail</span>
              <input
                name="email"
                type="email"
                maxLength={LIMITS.email}
                placeholder="anna@example.com — для чека"
                className="field"
                autoComplete="email"
                {...fieldProps("email", errors)}
              />
              <FieldError id="email" message={errors.email} />
            </label>

            <label>
              <span className="field-label">Комментарий</span>
              <textarea
                name="comment"
                rows={3}
                maxLength={LIMITS.comment}
                placeholder="Удобное время доставки, код домофона"
                className="field resize-y"
                {...fieldProps("comment", errors)}
              />
              <FieldError id="comment" message={errors.comment} />
            </label>

            <fieldset>
              <legend className="field-label">Оплата</legend>
              <div className="grid gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const disabled = m.key === "yookassa" && !onlinePayment;
                  return (
                    <label
                      key={m.key}
                      className={`card-flat flex items-start gap-3 p-3 ${disabled ? "opacity-55" : "cursor-pointer"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.key}
                        checked={payment === m.key}
                        disabled={disabled}
                        onChange={() => setPayment(m.key)}
                        className="mt-1 h-4 w-4 accent-[#1b2430]"
                      />
                      <span>
                        <span className="block text-[14px]">{m.label}</span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                          {disabled ? "Скоро — подключаем ЮKassa" : m.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {state && !state.ok && (
            <p role="alert" className="mt-5 rounded-lg border border-line bg-sand px-4 py-3 text-[14px]">
              {state.message}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button type="submit" disabled={pending || !orderId} className="btn btn-primary btn-block">
              {pending ? "Отправляю…" : payment === "yookassa" ? "Оформить и оплатить" : "Оформить заказ"}
            </button>
            {telegramReady && (
              <button type="button" onClick={sendToTelegram} className="btn btn-outline btn-block">
                Отправить в Telegram
              </button>
            )}
          </div>
          {telegramReady && (
            <p className="mt-3 text-center text-[12px] leading-relaxed text-muted">
              «Отправить в Telegram» открывает чат с Кристиной с уже заполненным текстом заказа.
            </p>
          )}

          <p className="mt-4 text-[12px] leading-relaxed text-muted">{deliveryText}</p>
          <ul className="mt-4 space-y-2 text-[12px] leading-relaxed text-muted">
            <li>· Оригинальный Davines от официального дистрибьютора</li>
            <li>· Подтверждение заказа в Telegram в течение рабочего дня</li>
            <li>· Доставка по Перми и СДЭК по России</li>
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
          </p>
        </form>
      </aside>
    </div>
  );
}
