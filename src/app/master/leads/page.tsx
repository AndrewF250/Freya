"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MasterLeadsList } from "@/components/master/leads-list";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { downloadJson } from "@/lib/master-store";
import { getLeads, importLeads } from "@/lib/leads-store";

export default function MasterLeadsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tick, setTick] = useState(0);
  const leads = getLeads();

  useEffect(() => {
    if (!isMasterAuthenticated()) router.replace("/master");
  }, [router]);

  const newCount = leads.filter((l) => l.status === "new").length;
  const orders = leads.filter((l) => l.kind === "order").length;
  const bookings = leads.filter((l) => l.kind === "booking").length;

  return (
    <div className="shell py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px] sm:text-[30px]">Заявки</h1>
          <p className="mt-2 text-[14px] text-ink-soft">
            {leads.length} всего · {newCount} новых · {bookings} записей · {orders} заказов
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => downloadJson("leads.json", getLeads())}
        >
          Экспорт
        </button>
        <button type="button" className="btn btn-soft btn-sm" onClick={() => fileRef.current?.click()}>
          Импорт
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const parsed = JSON.parse(await file.text());
              if (Array.isArray(parsed)) {
                importLeads(parsed);
                setTick((t) => t + 1);
              }
            } catch {
              window.alert("Не удалось прочитать файл. Нужен JSON с массивом заявок.");
            }
            e.target.value = "";
          }}
        />
      </div>

      <p className="mb-5 text-[13px] text-muted">
        Новые заявки сверху. Галочка — отметить обработанным, крестик — удалить с подтверждением.
        Заявки сохраняются в этом браузере; для переноса между устройствами используйте экспорт и импорт.
      </p>

      <MasterLeadsList key={tick} onChange={() => setTick((t) => t + 1)} />
    </div>
  );
}
