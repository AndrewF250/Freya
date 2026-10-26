"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_IMAGE_BG_PRESETS,
  DEFAULT_SLOT_PRESETS,
  parseBookingSlots,
  parseImageBgPresets,
  parseSlotPresets,
  sortTimeSlots,
  type SlotPreset,
} from "@/lib/booking-slots";
import { catalogFrom, type CatalogConfig } from "@/lib/catalog";
import { LONG_SETTINGS, SETTING_LABELS, DEFAULT_TELEGRAM_BOOKING_PRESET, type SettingKey, type Settings } from "@/lib/settings";
import { getStoredProducts, saveStoredSettings } from "@/lib/master-store";
import { BookingSlotsEditor } from "./booking-slots-editor";
import { CatalogEntriesEditor, LinesEditor } from "./catalog-editor";

const GROUPS: { title: string; hint?: string; keys: SettingKey[] }[] = [
  { title: "Мастер и студия", keys: ["masterName", "masterTitle", "salonName"] },
  { title: "Контакты", keys: ["phone", "email", "address", "hours"] },
  {
    title: "Соцсети",
    hint: "Полные ссылки. Instagram из РФ часто не открывается — для записи лучше Telegram и ВКонтакте.",
    keys: ["telegram", "whatsapp", "vk", "instagram"],
  },
  {
    title: "Тексты на сайте",
    hint: "Эти тексты видят клиенты на главной, в разделе «Студия» и при оформлении заказа.",
    keys: ["heroTitle", "heroText", "aboutText", "deliveryText"],
  },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>({
    ...initial,
    bookingSlots: parseBookingSlots(initial),
    bookingSlotPresets: parseSlotPresets(initial),
    imageBgPresets: parseImageBgPresets(initial),
    telegramMessagePreset: initial.telegramMessagePreset || DEFAULT_TELEGRAM_BOOKING_PRESET,
    catalog: catalogFrom(initial),
  });
  const [message, setMessage] = useState("");
  const catalog = catalogFrom(values);
  const products = useMemo(() => (typeof window === "undefined" ? [] : getStoredProducts()), []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextCatalog: CatalogConfig = {
      categories: catalog.categories,
      concerns: catalog.concerns,
      hairTypes: catalog.hairTypes,
      lines: catalog.lines,
    };
    saveStoredSettings({
      ...values,
      bookingSlots: sortTimeSlots(values.bookingSlots ?? []),
      bookingSlotPresets: values.bookingSlotPresets ?? DEFAULT_SLOT_PRESETS,
      imageBgPresets: values.imageBgPresets ?? DEFAULT_IMAGE_BG_PRESETS,
      telegramMessagePreset: values.telegramMessagePreset || DEFAULT_TELEGRAM_BOOKING_PRESET,
      catalog: nextCatalog,
    });
    setMessage("Настройки сохранены в браузере. Экспортируйте JSON для публикации на сайте.");
  }

  function updateSlots(slots: string[], presets: SlotPreset[]) {
    setValues((v) => ({ ...v, bookingSlots: slots, bookingSlotPresets: presets }));
  }

  function updateImageBgPresets(raw: string) {
    const presets = raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setValues((v) => ({ ...v, imageBgPresets: presets.length ? presets : DEFAULT_IMAGE_BG_PRESETS }));
  }

  function patchCatalog(patch: Partial<CatalogConfig>) {
    setValues((v) => ({ ...v, catalog: { ...catalogFrom(v), ...patch } }));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <BookingSlotsEditor
        slots={values.bookingSlots ?? parseBookingSlots(initial)}
        presets={values.bookingSlotPresets ?? DEFAULT_SLOT_PRESETS}
        onChange={updateSlots}
      />

      <fieldset className="card mb-5 p-6">
        <legend className="eyebrow mb-1">Пресет заявки в Telegram</legend>
        <p className="mb-4 text-[13px] leading-relaxed text-muted">
          Текст, который подставляется в чат Telegram при дублировании формы записи. Плейсхолдеры: {"{salon}"},{" "}
          {"{name}"}, {"{phone}"}, {"{email}"}, {"{service}"}, {"{when}"}, {"{comment}"}, {"{quiz}"}.
        </p>
        <textarea
          value={values.telegramMessagePreset ?? DEFAULT_TELEGRAM_BOOKING_PRESET}
          onChange={(e) => setValues((v) => ({ ...v, telegramMessagePreset: e.target.value }))}
          rows={10}
          className="field resize-y font-mono text-[13px]"
        />
      </fieldset>

      <fieldset className="card mb-5 p-6">
        <legend className="eyebrow mb-1">Карта</legend>
        <p className="mb-4 text-[13px] leading-relaxed text-muted">
          Если виджет пустой, оставьте поле эмбеда пустым — подставим поиск по адресу из контактов.
        </p>
        <div className="grid gap-5">
          <label>
            <span className="field-label">Ссылка на Яндекс Карты</span>
            <input
              value={values.yandexMapUrl ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, yandexMapUrl: e.target.value }))}
              className="field"
              placeholder="https://yandex.ru/maps/?text=..."
            />
          </label>
          <label>
            <span className="field-label">Адрес виджета (iframe src)</span>
            <input
              value={values.yandexMapEmbed ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, yandexMapEmbed: e.target.value }))}
              className="field"
              placeholder="https://yandex.ru/map-widget/v1/?mode=search&text=..."
            />
          </label>
        </div>
      </fieldset>

      <CatalogEntriesEditor
        title="Тип продукта"
        hint="Фильтры каталога и поле в карточке товара. Новые типы сразу можно навешивать на продукты."
        entries={catalog.categories}
        usedKeys={(key) => products.filter((p) => p.category === key).length}
        onChange={(categories) => patchCatalog({ categories })}
      />
      <CatalogEntriesEditor
        title="Задача"
        hint="Теги подбора и фильтр «Задача» в каталоге."
        entries={catalog.concerns}
        usedKeys={(key) => products.filter((p) => p.concerns.includes(key)).length}
        onChange={(concerns) => patchCatalog({ concerns })}
      />
      <CatalogEntriesEditor
        title="Для каких волос"
        hint="Теги на карточке товара и в квизе."
        entries={catalog.hairTypes}
        usedKeys={(key) => products.filter((p) => p.hairTypes.includes(key)).length}
        onChange={(hairTypes) => patchCatalog({ hairTypes })}
      />
      <LinesEditor lines={catalog.lines} onChange={(lines) => patchCatalog({ lines })} />

      <fieldset className="card mb-5 p-6">
        <legend className="eyebrow mb-1">Пресеты фона для фото товаров</legend>
        <p className="mb-4 text-[13px] leading-relaxed text-muted">
          Быстрый выбор в карточке товара. Укажите цвета через запятую или с новой строки.
        </p>
        <textarea
          value={(values.imageBgPresets ?? DEFAULT_IMAGE_BG_PRESETS).join("\n")}
          onChange={(e) => updateImageBgPresets(e.target.value)}
          rows={4}
          className="field resize-y font-mono text-[13px]"
          placeholder="#ffffff&#10;#f5f6f1"
        />
      </fieldset>

      {GROUPS.map((group) => (
        <fieldset key={group.title} className="card mb-5 p-6">
          <legend className="eyebrow mb-1">{group.title}</legend>
          {group.hint && <p className="mb-5 text-[13px] leading-relaxed text-muted">{group.hint}</p>}

          <div className={`grid gap-5 ${group.hint ? "" : "mt-4"} sm:grid-cols-2`}>
            {group.keys.map((key) => {
              const long = LONG_SETTINGS.includes(key);
              return (
                <label key={key} className={long ? "sm:col-span-2" : ""}>
                  <span className="field-label">{SETTING_LABELS[key]}</span>
                  {long ? (
                    <textarea
                      value={values[key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                      rows={key === "aboutText" ? 6 : 3}
                      className="field resize-y"
                    />
                  ) : (
                    <input
                      value={values[key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                      className="field"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {message && <p className="mb-5 text-[14px] text-olive-deep">{message}</p>}

      <button type="submit" className="btn btn-primary">
        Сохранить настройки
      </button>
    </form>
  );
}
