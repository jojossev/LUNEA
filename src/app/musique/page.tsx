import Link from "next/link";
import { TrackRow } from "@/components/TrackCard";
import { getPublishedTracks } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MusiquePage() {
  const list = await getPublishedTracks();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold">Musique</h1>
      <p className="mt-2 text-[var(--text-muted)]">Catalogue live depuis la base LUNEA.</p>
      <div className="lunea-card mt-8 p-2">
        {list.map((track, i) => (
          <TrackRow key={track.id} track={track} index={i + 1} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Artiste ?{" "}
        <Link href="/dashboard/publier" className="text-[var(--accent)]">
          Publier une chanson
        </Link>
      </p>
    </div>
  );
}
