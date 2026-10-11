import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNumber, getTrackById } from "@/lib/data";
import { PlayButton } from "@/components/PlayButton";
import { ReportButton } from "@/components/ReportButton";
import { DownloadTrackButton } from "@/components/DownloadTrackButton";

export const dynamic = "force-dynamic";

export default async function ChansonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const track = await getTrackById(id);
  if (!track) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="lunea-card overflow-hidden">
        <div className="relative aspect-[16/10] sm:aspect-[21/9]">
          <img src={track.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] to-transparent" />
        </div>
        <div className="relative -mt-16 px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <img
              src={track.cover}
              alt=""
              className="h-36 w-36 rounded-2xl object-cover shadow-xl ring-2 ring-[var(--border)]"
            />
            <div className="flex-1">
              <p className="text-sm text-[var(--accent)]">
                {track.genre} · {track.year}
              </p>
              <h1 className="font-display text-3xl font-bold">{track.title}</h1>
              <Link
                href={`/artiste/${track.artist.slug || track.artistId}`}
                className="mt-1 inline-block text-[var(--text-muted)] hover:text-[var(--accent)]"
              >
                {track.artistName}
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-start gap-3">
            <PlayButton track={track} />
            <DownloadTrackButton trackId={track.id} audioUrl={track.audioUrl} title={track.title} />
            <ReportButton trackId={track.id} />
          </div>

          <div className="mt-6 flex gap-8 text-sm">
            <div>
              <p className="font-semibold">{formatNumber(track.plays)}</p>
              <p className="text-[var(--text-muted)]">Écoutes</p>
            </div>
            <div>
              <p className="font-semibold">{formatNumber(track.downloads)}</p>
              <p className="text-[var(--text-muted)]">Téléchargements</p>
            </div>
            <div>
              <p className="font-semibold">{track.duration}</p>
              <p className="text-[var(--text-muted)]">Durée</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {track.tagsList.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--accent-muted)] px-3 py-1 text-xs text-[var(--accent)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
