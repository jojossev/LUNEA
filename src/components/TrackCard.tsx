"use client";

import Link from "next/link";
import type { TrackView } from "@/lib/types";
import { usePlayer } from "./GlobalPlayer";

export function TrackCard({ track }: { track: TrackView }) {
  const { play } = usePlayer();

  return (
    <article className="group w-32 shrink-0 animate-fade-up sm:w-36 md:w-40">
      <button
        type="button"
        onClick={() => play(track)}
        className="relative mb-2 block w-full overflow-hidden rounded-2xl"
      >
        <img
          src={track.cover}
          alt={track.title}
          className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)] text-base sm:h-12 sm:w-12 sm:text-lg">
            ▶
          </span>
        </span>
      </button>
      <Link href={`/chanson/${track.id}`} className="block truncate text-xs font-semibold hover:text-[var(--accent)] sm:text-sm">
        {track.title}
      </Link>
      <Link
        href={`/artiste/${track.artistId}`}
        className="block truncate text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] sm:text-xs"
      >
        {track.artistName}
      </Link>
    </article>
  );
}

export function TrackRow({ track, index }: { track: TrackView; index?: number }) {
  const { play } = usePlayer();

  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[var(--card)]">
      {index !== undefined && (
        <span className="w-6 text-center text-sm text-[var(--text-muted)]">{index}</span>
      )}
      <button type="button" onClick={() => play(track)} className="relative shrink-0">
        <img src={track.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
      </button>
      <div className="min-w-0 flex-1">
        <Link href={`/chanson/${track.id}`} className="block truncate font-medium hover:text-[var(--accent)]">
          {track.title}
        </Link>
        <Link href={`/artiste/${track.artistId}`} className="block truncate text-sm text-[var(--text-muted)]">
          {track.artistName}
        </Link>
      </div>
      <span className="hidden text-sm text-[var(--text-muted)] sm:block">{track.duration}</span>
      <button
        type="button"
        onClick={() => play(track)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)]"
        aria-label="Lire"
      >
        ▶
      </button>
    </div>
  );
}
