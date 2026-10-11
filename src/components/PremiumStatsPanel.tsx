"use client";

import { useEffect, useState } from "react";

type Stats = {
  range: string;
  listens: number;
  downloads: number;
  revenue: number;
  byDay: { label: string; value: number }[];
};

export function PremiumStatsPanel() {
  const [range, setRange] = useState<"week" | "month">("month");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`/api/artist/stats?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setStats(d);
      })
      .catch(() => undefined);
  }, [range]);

  const max = Math.max(1, ...(stats?.byDay.map((d) => d.value) || [1]));

  return (
    <div className="lunea-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Revenus monétisés</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRange("week")}
            className={`rounded-full px-3 py-1 text-xs ${
              range === "week" ? "bg-[var(--accent)] text-[var(--bg)]" : "bg-[var(--bg)] text-[var(--text-muted)]"
            }`}
          >
            7 jours
          </button>
          <button
            type="button"
            onClick={() => setRange("month")}
            className={`rounded-full px-3 py-1 text-xs ${
              range === "month" ? "bg-[var(--accent)] text-[var(--bg)]" : "bg-[var(--bg)] text-[var(--text-muted)]"
            }`}
          >
            30 jours
          </button>
        </div>
      </div>
      {stats && (
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          {stats.listens} écoutes · {stats.downloads} téléch. ·{" "}
          {stats.revenue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} $
        </p>
      )}
      <div className="flex h-40 items-end gap-1">
        {(stats?.byDay || []).map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-[var(--accent)]/80"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 4 : 0 }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
