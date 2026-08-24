"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginMaster } from "@/lib/master-auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const password = new FormData(e.currentTarget).get("password");
    await new Promise((r) => setTimeout(r, 300));
    if (typeof password === "string" && loginMaster(password)) {
      router.push("/master/products");
      router.refresh();
    } else {
      setError("Неверный пароль.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-8 p-6">
      <label>
        <span className="field-label">Пароль</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="field"
          placeholder="••••••••"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-line bg-sand px-4 py-3 text-[14px]">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-block mt-5">
        {pending ? "Проверяю…" : "Войти"}
      </button>

      <p className="mt-6 text-center text-[12px] text-muted">
        <Link href="/" className="underline underline-offset-4 hover:text-ink">
          Вернуться на сайт
        </Link>
      </p>
    </form>
  );
}
