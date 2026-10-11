import Link from "next/link";
import { formatNumber, getArtists } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ArtistesPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold">Artistes</h1>
      <p className="mt-2 text-[var(--text-muted)]">Données réelles depuis la base LUNEA.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {artists.map((artist) => {
          const plays = artist.tracks.reduce((s, t) => s + t.plays, 0);
          return (
            <Link
              key={artist.id}
              href={`/artiste/${artist.slug}`}
              className="lunea-card flex items-center gap-4 p-4 transition hover:bg-[var(--card-hover)]"
            >
              <img
                src={artist.imageUrl || "/logo-lunea.png"}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <p className="font-display text-lg font-semibold">
                  {artist.name}
                  {artist.verified && <span className="ml-1 text-[var(--accent)]">✓</span>}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {artist.city}, {artist.country} · {formatNumber(plays)} écoutes
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
