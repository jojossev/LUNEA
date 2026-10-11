import Link from "next/link";
import { TrackRow } from "@/components/TrackCard";
import { formatNumber, searchCatalog } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q = "", tab = "tout" } = await searchParams;
  const { tracks: matchedTracks, artists: matchedArtists } = await searchCatalog(q);

  const tabs = [
    { id: "tout", label: "Tout" },
    { id: "artistes", label: "Artistes" },
    { id: "chansons", label: "Chansons" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold">Recherche</h1>
      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher une chanson, un artiste, un genre…"
          className="lunea-input"
        />
      </form>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/recherche?q=${encodeURIComponent(q)}&tab=${t.id}`}
            className={`rounded-full px-4 py-2 text-sm whitespace-nowrap ${
              tab === t.id
                ? "bg-[var(--accent)] text-[var(--bg)] font-semibold"
                : "bg-[var(--card)] text-[var(--text-muted)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {(tab === "tout" || tab === "artistes") && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Artistes</h2>
          <div className="space-y-2">
            {matchedArtists.map((artist) => (
              <div key={artist.id} className="lunea-card flex items-center gap-3 p-3">
                <img
                  src={artist.imageUrl || "/logo-lunea.png"}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/artiste/${artist.slug}`} className="font-semibold hover:text-[var(--accent)]">
                    {artist.name}
                  </Link>
                  <p className="text-sm text-[var(--text-muted)]">
                    {artist.genre} · {artist._count.tracks} chansons
                  </p>
                </div>
                <button type="button" className="lunea-btn lunea-btn-ghost px-4 py-2 text-sm">
                  Suivre
                </button>
              </div>
            ))}
            {matchedArtists.length === 0 && (
              <p className="text-[var(--text-muted)]">Aucun artiste trouvé.</p>
            )}
          </div>
        </section>
      )}

      {(tab === "tout" || tab === "chansons") && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold">Chansons</h2>
          <div className="lunea-card p-2">
            {matchedTracks.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i + 1} />
            ))}
            {matchedTracks.length === 0 && (
              <p className="p-4 text-[var(--text-muted)]">Aucune chanson trouvée.</p>
            )}
          </div>
        </section>
      )}
      <p className="mt-4 text-xs text-[var(--text-muted)]">{formatNumber(matchedTracks.length)} résultats chansons</p>
    </div>
  );
}
