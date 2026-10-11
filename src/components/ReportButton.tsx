"use client";

import { useState } from "react";

const reasons = [
  "contenu illégal",
  "violation de droits d'auteur",
  "contenu offensant",
  "spam",
  "autre",
];

export function ReportButton({ trackId }: { trackId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (done) {
    return <span className="text-sm text-[var(--accent)]">Signalement envoyé</span>;
  }

  if (!open) {
    return (
      <button type="button" className="lunea-btn lunea-btn-ghost" onClick={() => setOpen(true)}>
        Signaler
      </button>
    );
  }

  return (
    <div className="lunea-card mt-2 w-full max-w-sm space-y-3 p-4">
      <p className="text-sm font-semibold">Signaler cette chanson</p>
      <select className="lunea-input" value={reason} onChange={(e) => setReason(e.target.value)}>
        {reasons.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          className="lunea-btn lunea-btn-primary flex-1 py-2 text-sm"
          onClick={async () => {
            const res = await fetch("/api/reports", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trackId, reason }),
            });
            const data = await res.json();
            if (!res.ok) {
              setError(data.error || "Erreur");
              return;
            }
            setDone(true);
          }}
        >
          Envoyer
        </button>
        <button type="button" className="lunea-btn lunea-btn-ghost py-2 text-sm" onClick={() => setOpen(false)}>
          Annuler
        </button>
      </div>
    </div>
  );
}
