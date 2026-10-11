"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type TrackRow = {
  id: string;
  title: string;
  status: string;
  plays: number;
  artistName: string;
};

export function AdminTracksTable({ tracks }: { tracks: TrackRow[] }) {
  const router = useRouter();

  async function setStatus(trackId: string, status: string) {
    await fetch("/api/admin/tracks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId, status }),
    });
    router.refresh();
  }

  return (
    <div className="lunea-card mt-6 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-[var(--border)] text-[var(--text-muted)]">
          <tr>
            <th className="px-4 py-3">Titre</th>
            <th className="px-4 py-3">Artiste</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Écoutes</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((t) => (
            <tr key={t.id} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-3">
                <Link href={`/chanson/${t.id}`} className="font-medium hover:text-[var(--accent)]">
                  {t.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{t.artistName}</td>
              <td className="px-4 py-3">{t.status}</td>
              <td className="px-4 py-3">{t.plays.toLocaleString("fr-FR")}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-[var(--text-muted)]">
                  <button type="button" className="hover:text-[var(--warning)]" onClick={() => setStatus(t.id, "HIDDEN")}>
                    Masquer
                  </button>
                  <button type="button" className="hover:text-[var(--accent)]" onClick={() => setStatus(t.id, "PUBLISHED")}>
                    Publier
                  </button>
                  <button type="button" className="hover:text-[var(--danger)]" onClick={() => setStatus(t.id, "SUSPENDED")}>
                    Suspendre
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
