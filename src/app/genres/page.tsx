import Link from "next/link";
import { genres, getPublishedTracks } from "@/lib/data";
import { TrackRow } from "@/components/TrackCard";

export const dynamic = "force-dynamic";

export default async function GenresPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g } = await searchParams;
  const selected = g || genres[0];
  const all = await getPublishedTracks();
  const list = all.filter((t) => t.genre === selected);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold">Genres</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Link
            key={genre}
            href={`/genres?g=${encodeURIComponent(genre)}`}
            className={`rounded-full px-4 py-2 text-sm ${
              selected === genre
                ? "bg-[var(--accent)] font-semibold text-[var(--bg)]"
                : "border border-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {genre}
          </Link>
        ))}
      </div>
      <div className="lunea-card mt-8 p-2">
        {list.length > 0 ? (
          list.map((track, i) => <TrackRow key={track.id} track={track} index={i + 1} />)
        ) : (
          <p className="p-4 text-[var(--text-muted)]">Aucune chanson dans ce genre pour le moment.</p>
        )}
      </div>
    </div>
  );
}
