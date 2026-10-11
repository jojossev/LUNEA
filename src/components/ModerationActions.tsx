"use client";

import { useRouter } from "next/navigation";

type ReportRow = {
  id: string;
  reason: string;
  status: string;
  track: { title: string };
};

export function ModerationActions({ reports }: { reports: ReportRow[] }) {
  const router = useRouter();

  async function act(reportId: string, action: "hide" | "delete" | "resolve") {
    await fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action, status: "RESOLVED" }),
    });
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="lunea-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{r.track.title}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Motif : {r.reason}</p>
            </div>
            <span className="rounded-full bg-[var(--bg)] px-3 py-1 text-xs text-[var(--text-muted)]">
              {r.status}
            </span>
          </div>
          {r.status !== "RESOLVED" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="lunea-btn lunea-btn-primary px-4 py-2 text-sm"
                onClick={() => act(r.id, "resolve")}
              >
                Résoudre
              </button>
              <button
                type="button"
                className="lunea-btn lunea-btn-ghost px-4 py-2 text-sm"
                onClick={() => act(r.id, "hide")}
              >
                Masquer
              </button>
              <button
                type="button"
                className="lunea-btn lunea-btn-ghost px-4 py-2 text-sm text-[var(--danger)]"
                onClick={() => act(r.id, "delete")}
              >
                Suspendre
              </button>
            </div>
          )}
        </div>
      ))}
      {reports.length === 0 && <p className="text-[var(--text-muted)]">Aucun signalement.</p>}
    </div>
  );
}
