"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/master/login-form";
import { isMasterAuthenticated } from "@/lib/master-auth";
import { getSettings } from "@/lib/settings";

export default function MasterLoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const settings = getSettings();

  useEffect(() => {
    if (isMasterAuthenticated()) router.replace("/master/products");
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="shell flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="wordmark text-[24px]">{settings.salonName}</p>
          <p className="mt-3 text-[14px] text-muted">Кабинет мастера</p>
        </div>
        <LoginForm />
        <p className="mt-8 text-center text-[12px] leading-relaxed text-muted">
          Пароль по умолчанию: <code className="text-ink-soft">freya2025</code>
        </p>
      </div>
    </div>
  );
}
