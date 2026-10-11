"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuneaLogo } from "@/components/LuneaLogo";
import { useAuth } from "@/lib/auth-client";

export default function ConnexionPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: fd.get("login"),
        password: fd.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }
    await refresh();
    router.push(data.redirect || "/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="lunea-card w-full p-6 sm:p-8 animate-fade-up">
        <div className="mb-4 flex justify-center">
          <LuneaLogo href="/" size="md" />
        </div>
        <h1 className="font-display text-center text-2xl font-bold">Connexion</h1>
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          Ex. lunez@lunea.app / lunea123
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <input className="lunea-input" name="login" required placeholder="E-mail ou pseudo" />
          <input className="lunea-input" type="password" name="password" required placeholder="Mot de passe" />
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={loading} className="lunea-btn lunea-btn-primary w-full py-3">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Pas de compte ?{" "}
          <Link href="/inscription" className="text-[var(--accent)]">
            Inscription
          </Link>
        </p>
      </div>
    </div>
  );
}
