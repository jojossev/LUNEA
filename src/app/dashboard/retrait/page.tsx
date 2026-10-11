"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArtistSidebar } from "@/components/DashboardUI";
import { useAuth } from "@/lib/auth-client";

export default function RetraitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"newcoin" | "flexpay">("newcoin");

  useEffect(() => {
    if (!loading && (!user || user.role !== "ARTIST" || !user.artistId)) {
      router.push("/connexion");
      return;
    }
    if (user?.artistId) {
      fetch(`/api/artists/${user.artistId}`)
        .then((r) => r.json())
        .then((d) => setBalance(d.artist?.realBalance ?? 0))
        .catch(() => undefined);
    }
  }, [user, loading, router]);

  const canWithdraw = balance >= 500;

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
        <ArtistSidebar active="/dashboard/retrait" />
        <div className="lunea-card flex-1 p-8 text-center">
          <p className="font-display text-2xl font-bold">Demande envoyée</p>
          <p className="mt-2 text-[var(--text-muted)]">Statut : En attente · journalisé</p>
          <Link href="/dashboard/portefeuille" className="lunea-btn lunea-btn-primary mt-6">
            Portefeuille
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <ArtistSidebar active="/dashboard/retrait" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold">Retrait</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Minimum 500 $</p>

        <form
          className="lunea-card mt-6 max-w-lg space-y-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/withdrawals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: Number(fd.get("amount")),
                paymentMethod,
                [paymentMethod === "newcoin" ? "newcoinAccount" : "flexpayAccount"]:
                  fd.get(paymentMethod === "newcoin" ? "newcoin" : "flexpay"),
              }),
            });
            const data = await res.json();
            if (!res.ok) {
              setError(data.error || "Erreur");
              return;
            }
            setSubmitted(true);
          }}
        >
          <div className="rounded-xl bg-[var(--bg)] p-4 text-sm">
            Solde :{" "}
            <span className="font-semibold text-[var(--accent)]">
              {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} $
            </span>
          </div>
          {!canWithdraw && (
            <div className="rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm text-[var(--warning)]">
              Solde insuffisant (minimum 500 $).
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Montant</label>
            <input
              className="lunea-input"
              name="amount"
              type="number"
              min={500}
              max={balance}
              defaultValue={canWithdraw ? 500 : undefined}
              disabled={!canWithdraw}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Méthode de retrait</label>
            <div className="space-y-2">
              <button
                type="button"
                className={`w-full rounded-lg border-2 p-3 text-left transition ${
                  paymentMethod === "newcoin"
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
                onClick={() => setPaymentMethod("newcoin")}
                disabled={!canWithdraw}
              >
                <p className="font-semibold">Newcoin</p>
              </button>
              <button
                type="button"
                className={`w-full rounded-lg border-2 p-3 text-left transition ${
                  paymentMethod === "flexpay"
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
                onClick={() => setPaymentMethod("flexpay")}
                disabled={!canWithdraw}
              >
                <p className="font-semibold">Flex Pay</p>
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">
              Compte {paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay"}
            </label>
            <input
              className="lunea-input"
              name={paymentMethod === "newcoin" ? "newcoin" : "flexpay"}
              required
              disabled={!canWithdraw}
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="submit"
            disabled={!canWithdraw}
            className="lunea-btn lunea-btn-primary w-full py-3 disabled:opacity-40"
          >
            Demander le retrait
          </button>
        </form>
      </div>
    </div>
  );
}
