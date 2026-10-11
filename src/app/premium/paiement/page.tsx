"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-client";

export default function PaiementPremiumPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const [account, setAccount] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"newcoin" | "flexpay">("newcoin");

  useEffect(() => {
    if (!loading && (!user || user.role !== "ARTIST")) {
      router.push("/connexion");
    }
  }, [user, loading, router]);

  if (paid) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="lunea-card p-8">
          <p className="font-display text-2xl font-bold text-[var(--accent)]">Premium activé</p>
          <p className="mt-2 text-[var(--text-muted)]">31 jours · {paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay"}</p>
          <Link href="/dashboard/premium" className="lunea-btn lunea-btn-primary mt-6 w-full">
            Dashboard Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="lunea-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">Paiement Premium</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">12 $ / 31 jours</p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            className={`w-full rounded-xl border-2 p-4 text-left transition ${
              paymentMethod === "newcoin"
                ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
            onClick={() => setPaymentMethod("newcoin")}
          >
            <p className="font-semibold">Newcoin</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Sans clés API : simulation. Avec NEWCOIN_API_* : paiement live.
            </p>
          </button>

          <button
            type="button"
            className={`w-full rounded-xl border-2 p-4 text-left transition ${
              paymentMethod === "flexpay"
                ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
            onClick={() => setPaymentMethod("flexpay")}
          >
            <p className="font-semibold">Flex Pay</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Sans clés API : simulation. Avec FLEXPAY_API_* : paiement live.
            </p>
          </button>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm text-[var(--text-muted)]">
            Compte {paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay"}
          </label>
          <input
            className="lunea-input"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={paymentMethod === "newcoin" ? "votre_compte_newcoin" : "votre_compte_flexpay"}
          />
        </div>

        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="button"
          disabled={busy}
          className="lunea-btn lunea-btn-primary mt-6 w-full py-3"
          onClick={async () => {
            setBusy(true);
            setError("");
            const res = await fetch("/api/premium/activate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentMethod,
                [paymentMethod === "newcoin" ? "newcoinAccount" : "flexpayAccount"]: account,
              }),
            });
            const data = await res.json();
            setBusy(false);
            if (!res.ok) {
              setError(data.error || "Erreur");
              return;
            }
            await refresh();
            setPaid(true);
          }}
        >
          {busy ? "Paiement…" : `Payer 12 $ avec ${paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay"}`}
        </button>
        <Link href="/premium" className="mt-4 block text-center text-sm text-[var(--text-muted)]">
          Annuler
        </Link>
      </div>
    </div>
  );
}
