"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { formatNumber } from "@/lib/data";
import { ReportButton } from "@/components/ReportButton";
import { DownloadTrackButton } from "@/components/DownloadTrackButton";
import { usePlayer } from "@/components/GlobalPlayer";
import type { TrackWithArtist } from "@/lib/types";

export default function ChansonClientPage({
  track,
}: {
  track: TrackWithArtist;
}) {
  const { play, track: currentTrack, playing, toggle } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isCurrentTrack = currentTrack?.id === track.id;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10 md:px-6">
      <div className="lunea-card overflow-hidden">
        {/* Hero section with background */}
        <div className="relative aspect-[16/10] sm:aspect-[21/9] lg:aspect-[2/1]">
          <img src={track.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/80 to-transparent" />
        </div>

        <div className="relative -mt-24 px-4 pb-8 sm:-mt-16 sm:px-6 sm:pb-8 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end md:gap-6">
            <img
              src={track.cover}
              alt=""
              className="h-32 w-32 rounded-2xl object-cover shadow-xl ring-2 ring-[var(--border)] sm:h-36 sm:w-36 md:h-40 md:w-40"
            />
            <div className="flex-1">
              <p className="text-xs text-[var(--accent)] sm:text-sm">
                {track.genre} · {track.year}
              </p>
              <h1 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">{track.title}</h1>
              <Link
                href={`/artiste/${track.artist?.slug || track.artistId}`}
                className="mt-1 inline-block text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
              >
                {track.artistName}
              </Link>
            </div>
          </div>

          {/* Audio Player */}
          <div className="mt-8 rounded-2xl bg-[var(--bg-elevated)] p-4 sm:p-6">
            <audio
              ref={audioRef}
              src={track.audioUrl || ""}
              className="hidden"
            />
            
            <div className="mb-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (isCurrentTrack) {
                    toggle();
                  } else {
                    play(track);
                  }
                }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--bg)] text-xl shadow-lg transition hover:scale-105 sm:h-16 sm:w-16 sm:text-2xl"
              >
                {isCurrentTrack && playing ? "⏸" : "▶"}
              </button>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] sm:text-sm">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="flex-1 accent-[var(--accent)]"
                  />
                  <span className="text-xs text-[var(--text-muted)] sm:text-sm">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl bg-[var(--bg-elevated)] p-4 sm:gap-6 sm:p-6">
            <div className="text-center">
              <p className="font-display text-xl font-bold sm:text-2xl">{formatNumber(track.plays)}</p>
              <p className="text-xs text-[var(--text-muted)] sm:text-sm">Écoutes</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold sm:text-2xl">{formatNumber(track.downloads)}</p>
              <p className="text-xs text-[var(--text-muted)] sm:text-sm">Téléchargements</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold sm:text-2xl">{track.duration}</p>
              <p className="text-xs text-[var(--text-muted)] sm:text-sm">Durée</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <DownloadTrackButton trackId={track.id} audioUrl={track.audioUrl || ""} title={track.title} />
            <ReportButton trackId={track.id} />
          </div>

          {/* Tags */}
          {track.tagsList && track.tagsList.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {track.tagsList.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--accent-muted)] px-3 py-1.5 text-xs text-[var(--accent)] sm:text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {track.description && (
            <div className="mt-6 rounded-2xl bg-[var(--bg-elevated)] p-4 sm:p-6">
              <h3 className="font-display text-lg font-bold mb-2 sm:text-xl">Description</h3>
              <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{track.description}</p>
            </div>
          )}

          {/* Lyrics */}
          {track.lyrics && (
            <div className="mt-6 rounded-2xl bg-[var(--bg-elevated)] p-4 sm:p-6">
              <h3 className="font-display text-lg font-bold mb-2 sm:text-xl">Paroles</h3>
              <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{track.lyrics}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
