"use client";

import type { TrackView } from "@/lib/types";
import { usePlayer } from "@/components/GlobalPlayer";

export function PlayButton({ track }: { track: TrackView }) {
  const { play } = usePlayer();
  return (
    <button
      type="button"
      onClick={() => play(track)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)]"
      aria-label="Lire"
    >
      ▶
    </button>
  );
}
