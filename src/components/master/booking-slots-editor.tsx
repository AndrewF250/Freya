"use client";

import { useState } from "react";
import { normalizeTimeSlot, sortTimeSlots, type SlotPreset } from "@/lib/booking-slots";

export function BookingSlotsEditor({
  slots,
  presets,
  onChange,
}: {
  slots: string[];
  presets: SlotPreset[];
  onChange: (slots: string[], presets: SlotPreset[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [presetName, setPresetName] = useState("");
  const [error, setError] = useState("");

  function updateSlots(next: string[]) {
    onChange(sortTimeSlots(next), presets);
  }

  function addSlot() {
    const slot = normalizeTimeSlot(draft);
    if (!slot) {
      setError("Формат времени: ЧЧ:ММ, например 14:30");
      return;
    }
    setError("");
    setDraft("");
    updateSlots([...slots, slot]);
  }

  function removeSlot(slot: string) {
    updateSlots(slots.filter((s) => s !== slot));
  }

  function applyPreset(preset: SlotPreset) {
    onChange(sortTimeSlots(preset.slots), presets);
  }

  function savePreset() {
    const name = presetName.trim();
    if (!name) {
      setError("Введите название пресета");
      return;
    }
    if (slots.length === 0) {
      setError("Сначала добавьте хотя бы один слот");
      return;
    }
    const id = `preset-${Date.now()}`;
    const next = [...presets.filter((p) => p.name !== name), { id, name, slots: sortTimeSlots(slots) }];
    setPresetName("");
    setError("");
    onChange(slots, next);
  }

  function deletePreset(id: string) {
    onChange(slots, presets.filter((p) => p.id !== id));
  }

  return (
    <fieldset className="card mb-5 p-6">
      <legend className="eyebrow mb-1">Запись — слоты времени</legend>
      <p className="mb-5 text-[13px] leading-relaxed text-muted">
        Эти интервалы показываются клиенту в форме записи. Выберите пресет или соберите свой набор.
      </p>

      <div className="mb-4">
        <p className="field-label mb-2">Пресеты</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-1">
              <button type="button" className="chip" onClick={() => applyPreset(preset)}>
                {preset.name}
              </button>
              {!["weekday", "morning", "evening", "saturday"].includes(preset.id) && (
                <button
                  type="button"
                  onClick={() => deletePreset(preset.id)}
                  className="rounded-pill px-2 py-1 text-[12px] text-muted hover:text-ink"
                  aria-label={`Удалить пресет ${preset.name}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="field-label mb-2">Активные слоты на сайте</p>
        {slots.length === 0 ? (
          <p className="text-[13px] text-muted">Слотов пока нет — добавьте время ниже или выберите пресет.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                className="chip gap-2"
                data-active
                onClick={() => removeSlot(slot)}
                title="Нажмите, чтобы убрать"
              >
                {slot}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[140px] flex-1">
          <span className="field-label">Добавить время</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="14:30"
            className="field"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSlot();
              }
            }}
          />
        </label>
        <button type="button" className="btn btn-soft btn-sm" onClick={addSlot}>
          Добавить
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
        <label className="min-w-[200px] flex-1">
          <span className="field-label">Сохранить текущие слоты как пресет</span>
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Например: Пятница короткий день"
            className="field"
          />
        </label>
        <button type="button" className="btn btn-outline btn-sm" onClick={savePreset}>
          Сохранить пресет
        </button>
      </div>

      {error && <p className="mt-3 text-[13px] text-olive-deep">{error}</p>}
    </fieldset>
  );
}
