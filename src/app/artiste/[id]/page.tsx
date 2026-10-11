import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNumber, getArtistByIdOrSlug } from "@/lib/data";
import { PlayButton } from "@/components/PlayButton";

export const dynamic = "force-dynamic";

export default async function ArtistePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await getArtistByIdOrSlug(id);
  if (!artist) notFound();

  const songs = artist.mappedTracks.filter((t) => t.status === "PUBLISHED");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="lunea-card flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <img
          src={artist.image}
          alt={artist.name}
          className="mx-auto h-36 w-36 rounded-full object-cover sm:mx-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-bold">
            {artist.name}
            {artist.verified && <span className="ml-2 text-[var(--accent)]">✓</span>}
          </h1>
          <p className="mt-1 text-[var(--text-muted)]">
            {artist.city}, {artist.country} · {artist.genre}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-6 sm:justify-start">
            <div>
              <p className="font-display text-xl font-bold">{artist.songsCount}</p>
              <p className="text-xs text-[var(--text-muted)]">Chansons</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">{formatNumber(artist.plays)}</p>
              <p className="text-xs text-[var(--text-muted)]">Écoutes</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">{formatNumber(artist.downloads)}</p>
              <p className="text-xs text-[var(--text-muted)]">Téléchargements</p>
            </div>
          </div>
          <button type="button" className="lunea-btn lunea-btn-primary mt-5">
            Suivre
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-4 border-b border-[var(--border)] text-sm">
        <span className="border-b-2 border-[var(--accent)] px-1 pb-3 font-semibold text-[var(--accent)]">
          Chansons
        </span>
        <span className="px-1 pb-3 text-[var(--text-muted)]">Albums</span>
        <span className="px-1 pb-3 text-[var(--text-muted)]">Biographie</span>
      </div>

      <p className="mt-6 text-[var(--text-muted)]">{artist.bio}</p>

      <div className="mt-6 space-y-2">
        {songs.map((track) => (
          <div key={track.id} className="lunea-card flex items-center gap-3 p-3">
            <img src={track.cover} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <Link href={`/chanson/${track.id}`} className="font-semibold hover:text-[var(--accent)]">
                {track.title}
              </Link>
              <p className="text-sm text-[var(--text-muted)]">
                {formatNumber(track.plays)} écoutes · {track.duration}
              </p>
            </div>
            <PlayButton track={track} />
          </div>
        ))}
      </div>
    </div>
  );
}
