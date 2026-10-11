"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type ArtistRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  verified: boolean;
  premiumStatus: string;
  imageUrl: string | null;
  plays: number;
  songsCount: number;
  userStatus?: string;
};

export function AdminArtistsList({ artists }: { artists: ArtistRow[] }) {
  const router = useRouter();

  async function patch(artistId: string, body: Record<string, unknown>) {
    await fetch("/api/admin/artists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistId, ...body }),
    });
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-3">
      {artists.map((a) => (
        <div key={a.id} className="lunea-card flex flex-wrap items-center gap-4 p-4">
          <img
            src={a.imageUrl || "/logo-lunea.png"}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <Link href={`/artiste/${a.slug}`} className="font-semibold hover:text-[var(--accent)]">
              {a.name}
              {a.verified && <span className="ml-1 text-[var(--accent)]">✓</span>}
            </Link>
            <p className="text-sm text-[var(--text-muted)]">
              {a.city} · {a.plays.toLocaleString("fr-FR")} écoutes · {a.songsCount} chansons ·{" "}
              {a.premiumStatus}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              className="lunea-btn lunea-btn-ghost px-3 py-1.5"
              onClick={() => patch(a.id, { verified: !a.verified })}
            >
              {a.verified ? "Retirer vérif." : "Vérifier"}
            </button>
            <button
              type="button"
              className="lunea-btn lunea-btn-ghost px-3 py-1.5"
              onClick={() => patch(a.id, { suspendUser: true })}
            >
              Suspendre
            </button>
            <button
              type="button"
              className="lunea-btn lunea-btn-ghost px-3 py-1.5"
              onClick={() => patch(a.id, { suspendUser: false })}
            >
              Réactiver
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
