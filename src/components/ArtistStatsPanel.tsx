"use client";

import { useEffect, useState } from "react";

type StatsPayload = {
  range: string;
  listens: number;
  downloads: number;
  revenue: number;
  byDay: { label: string; value: number }[];
};

export function ArtistStatsPanel() {
  const [range, setRange] = useState<"week" | "month">("month");
  const [data, setData] = useState<StatsPayload | null>(null);

  useEffect(() => {
    fetch(`/api/artist/stats?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
      })
      .catch(() => undefined);
  }, [range]);

  const max = Math.max(1, ...(data?.byDay.map((d) => d.value) ?? [1]));

  return (
    <div className="lunea-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Revenus / activité</h2>
        <div className="flex gap-2">
          {(["week", "month"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-xs ${
                range === r ? "bg-[var(--accent)] text-[var(--bg)] font-semibold" : "bg-[var(--bg)] text-[var(--text-muted)]"
              }`}
            >
              {r === "week" ? "7 jours" : "30 jours"}
            </button>
          ))}
        </div>
      </div>

      {data ? (
        <>
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            {data.listens} écoutes · {data.downloads} téléchargements ·{" "}
            {data.revenue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} $
          </p>
          <div className="flex h-36 items-end gap-1">
            {data.byDay.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[var(--accent)]/80"
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 0 }}
                  title={`${d.label}: ${d.value}`}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Chargement des stats…</p>
      )}
    </div>
  );
}
