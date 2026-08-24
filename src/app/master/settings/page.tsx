"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SettingsForm } from "@/components/master/settings-form";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { downloadJson, exportMasterData, getStoredSettings } from "@/lib/master-store";

export default function MasterSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState(getStoredSettings());

  useEffect(() => {
    if (!isMasterAuthenticated()) router.replace("/master");
  }, [router]);

  return (
    <div className="shell py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px]">Настройки</h1>
          <p className="mt-2 text-[14px] text-muted">Контакты, тексты и ссылки студии.</p>
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

      <SettingsForm
        initial={settings}
        key={JSON.stringify(settings)}
      />
    </div>
  );
}
