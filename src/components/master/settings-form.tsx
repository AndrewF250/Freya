"use client";

import { useState } from "react";
import {
  DEFAULT_IMAGE_BG_PRESETS,
  DEFAULT_SLOT_PRESETS,
  parseBookingSlots,
  parseImageBgPresets,
  parseSlotPresets,
  sortTimeSlots,
  type SlotPreset,
} from "@/lib/booking-slots";
import { LONG_SETTINGS, SETTING_LABELS, type SettingKey, type Settings } from "@/lib/settings";
import { saveStoredSettings } from "@/lib/master-store";
import { BookingSlotsEditor } from "./booking-slots-editor";

const GROUPS: { title: string; hint?: string; keys: SettingKey[] }[] = [
  { title: "Мастер и студия", keys: ["masterName", "masterTitle", "salonName"] },
  { title: "Контакты", keys: ["phone", "email", "address", "hours"] },
  {
    title: "Соцсети",
    hint: "Полные ссылки вида https://t.me/username. Оставьте пустым, чтобы убрать кнопку с сайта.",
    keys: ["telegram", "whatsapp", "instagram"],
  },
  {
    title: "Тексты на сайте",
    hint: "Эти тексты видят клиенты на главной, в разделе «О Кристине» и при оформлении заказа.",
    keys: ["heroTitle", "heroText", "aboutText", "deliveryText"],
  },
];

export function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>({
    ...initial,
    bookingSlots: parseBookingSlots(initial),
    bookingSlotPresets: parseSlotPresets(initial),
    imageBgPresets: parseImageBgPresets(initial),
  });
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveStoredSettings({
      ...values,
      bookingSlots: sortTimeSlots(values.bookingSlots ?? []),
      bookingSlotPresets: values.bookingSlotPresets ?? DEFAULT_SLOT_PRESETS,
      imageBgPresets: values.imageBgPresets ?? DEFAULT_IMAGE_BG_PRESETS,
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

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <BookingSlotsEditor
        slots={values.bookingSlots ?? parseBookingSlots(initial)}
        presets={values.bookingSlotPresets ?? DEFAULT_SLOT_PRESETS}
        onChange={updateSlots}
      />

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
