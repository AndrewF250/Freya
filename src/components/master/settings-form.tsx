"use client";

import { useState } from "react";
import { SETTING_DEFAULTS, SETTING_LABELS, LONG_SETTINGS, type SettingKey } from "@/lib/settings";
import { saveStoredSettings } from "@/lib/master-store";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState("");

  const keys = Object.keys(SETTING_DEFAULTS) as SettingKey[];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveStoredSettings(values as never);
    setMessage("Настройки сохранены в браузере. Не забудьте экспортировать JSON для публикации на сайте.");
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {keys.map((key) => (
          <label key={key} className={LONG_SETTINGS.includes(key) ? "sm:col-span-2" : ""}>
            <span className="field-label">{SETTING_LABELS[key]}</span>
            {LONG_SETTINGS.includes(key) ? (
              <textarea
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                rows={4}
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
        ))}
      </div>

      {message && <p className="mt-5 text-[14px] text-olive-deep">{message}</p>}

      <button type="submit" className="btn btn-primary mt-6">
        Сохранить
      </button>
    </form>
  );
}
