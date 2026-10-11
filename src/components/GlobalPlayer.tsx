"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TrackView } from "@/lib/types";
import { LISTEN_VALIDATE_SECONDS } from "@/lib/constants";

type PlayerState = {
  track: TrackView | null;
  tracks: TrackView[];
  playing: boolean;
  progress: number;
  play: (track: TrackView) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  download: () => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

function getClientKey() {
  if (typeof window === "undefined") return "ssr";
  const key = "lunea_client_key";
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<TrackView[]>([]);
  const [track, setTrack] = useState<TrackView | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<TrackView | null>(null);
  const countedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.tracks ?? []) as TrackView[];
        setTracks(list);
        setTrack((current) => current ?? list[0] ?? null);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTime = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
      const t = trackRef.current;
      if (t && audio.currentTime >= LISTEN_VALIDATE_SECONDS && !countedRef.current.has(t.id)) {
        countedRef.current.add(t.id);
        fetch("/api/stats/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackId: t.id,
            type: "listen",
            listenedSeconds: Math.floor(audio.currentTime),
            clientKey: getClientKey(),
          }),
        }).catch(() => undefined);
      }
    };

    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const play = useCallback((t: TrackView) => {
    const audio = audioRef.current;
    if (!audio) return;
    setTrack(t);
    trackRef.current = t;
    setProgress(0);
    if (t.audioUrl) {
      audio.src = t.audioUrl;
      audio.play().catch(() => undefined);
      setPlaying(true);
    } else {
      setPlaying(true);
    }
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (!audio.src && track.audioUrl) audio.src = track.audioUrl;
      audio.play().catch(() => undefined);
      setPlaying(true);
    }
  }, [playing, track]);

  const next = useCallback(() => {
    if (!track || tracks.length === 0) return;
    const i = tracks.findIndex((t) => t.id === track.id);
    play(tracks[(i + 1) % tracks.length]);
  }, [track, tracks, play]);

  const prev = useCallback(() => {
    if (!track || tracks.length === 0) return;
    const i = tracks.findIndex((t) => t.id === track.id);
    play(tracks[(i - 1 + tracks.length) % tracks.length]);
  }, [track, tracks, play]);

  const download = useCallback(() => {
    if (!track) return;
    fetch("/api/stats/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackId: track.id,
        type: "download",
        clientKey: getClientKey(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const url = data.audioUrl || track.audioUrl;
        if (url) {
          const a = document.createElement("a");
          a.href = url;
          a.download = `${track.title}.mp3`;
          a.click();
        }
      })
      .catch(() => undefined);
  }, [track]);

  const value = useMemo(
    () => ({ track, tracks, playing, progress, play, toggle, next, prev, download }),
    [track, tracks, playing, progress, play, toggle, next, prev, download]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function GlobalPlayer() {
  const { track, playing, progress, toggle, next, prev, download } = usePlayer();

  if (!track) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--bg-elevated)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
        <img src={track.cover} alt="" className="h-12 w-12 rounded-lg object-cover" />
        <div className="min-w-0 flex-1 md:max-w-[200px]">
          <p className="truncate text-sm font-semibold">{track.title}</p>
          <Link
            href={`/artiste/${track.artistId}`}
            className="truncate text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            {track.artistName}
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button type="button" onClick={prev} className="text-[var(--text-muted)] hover:text-white" aria-label="Précédent">
              ⏮
            </button>
            <button
              type="button"
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)] font-bold"
              aria-label={playing ? "Pause" : "Lecture"}
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button type="button" onClick={next} className="text-[var(--text-muted)] hover:text-white" aria-label="Suivant">
              ⏭
            </button>
          </div>
          <div className="hidden w-full max-w-md items-center gap-2 sm:flex">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">{track.duration}</span>
          </div>
          <p className="hidden text-[10px] text-[var(--text-muted)] sm:block">
            Écoute validée après {LISTEN_VALIDATE_SECONDS}s
          </p>
        </div>

        <button type="button" className="lunea-btn lunea-btn-ghost hidden px-3 py-2 text-xs md:inline-flex" onClick={download}>
          Télécharger
        </button>
      </div>
    </div>
  );
}
