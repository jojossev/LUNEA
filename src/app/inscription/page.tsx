"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuneaLogo } from "@/components/LuneaLogo";
import { useAuth } from "@/lib/auth-client";

export default function InscriptionPage() {
  const [role, setRole] = useState<"user" | "artist">("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        email: fd.get("email"),
        password: fd.get("password"),
        phone: fd.get("phone") || undefined,
        role,
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
        <h1 className="font-display text-center text-2xl font-bold">Créer un compte</h1>
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">Session sécurisée (cookie httpOnly)</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-[var(--bg)] p-1">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`rounded-lg py-2.5 text-sm font-medium ${
              role === "user" ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--text-muted)]"
            }`}
          >
            Utilisateur
          </button>
          <button
            type="button"
            onClick={() => setRole("artist")}
            className={`rounded-lg py-2.5 text-sm font-medium ${
              role === "artist" ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--text-muted)]"
            }`}
          >
            Artiste
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input className="lunea-input" name="username" required placeholder="Pseudo" />
          <input className="lunea-input" type="email" name="email" required placeholder="E-mail" />
          <input className="lunea-input" type="password" name="password" required placeholder="Mot de passe" minLength={6} />
          <input className="lunea-input" type="tel" name="phone" placeholder="Téléphone (optionnel)" />
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={loading} className="lunea-btn lunea-btn-primary w-full py-3">
            {loading ? "Création…" : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-[var(--accent)]">
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
