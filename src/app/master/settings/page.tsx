"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SettingsForm } from "@/components/master/settings-form";
import { QuizSettings } from "@/components/master/quiz-settings";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { downloadJson, exportMasterData, getStoredSettings } from "@/lib/master-store";

const TABS = [
  { key: "general", label: "Студия и сайт", hint: "Контакты, тексты, слоты записи и пресеты студии." },
  { key: "quiz", label: "Анкета подбора", hint: "Вопросы, варианты ответов и продукты для подбора ухода." },
] as const;
type Tab = (typeof TABS)[number]["key"];

function MasterSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "quiz" ? "quiz" : "general";

  useEffect(() => {
    if (!isMasterAuthenticated()) router.replace("/master");
  }, [router]);

  return (
    <div className="shell py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px]">Настройки</h1>
          <p className="mt-2 text-[14px] text-muted">{TABS.find((t) => t.key === tab)?.hint}</p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            const data = exportMasterData();
            downloadJson("settings.json", data.settings);
          }}
        >
          Экспорт настроек
        </button>
      </div>

      <div role="tablist" aria-label="Разделы настроек" className="mb-8 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => router.replace(t.key === "general" ? "/master/settings" : `/master/settings?tab=${t.key}`)}
            className={`-mb-px border-b-2 px-1 pb-3 text-[14px] transition-colors sm:px-2 ${
              tab === t.key ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "quiz" ? <QuizSettings /> : <GeneralSettings />}
      </div>
    </div>
  );
}

/** Читаем настройки при каждом открытии вкладки — после правок анкеты они могли измениться. */
function GeneralSettings() {
  const [settings] = useState(getStoredSettings);
  return <SettingsForm initial={settings} />;
}

export default function MasterSettingsPage() {
  return (
    <Suspense fallback={<div className="shell py-10 text-muted">Загрузка…</div>}>
      <MasterSettingsContent />
    </Suspense>
  );
}
