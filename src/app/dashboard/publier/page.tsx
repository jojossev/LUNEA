"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArtistSidebar } from "@/components/DashboardUI";
import { useAuth } from "@/lib/auth-client";
import { MAX_MP3_MB } from "@/lib/constants";

const genres = [
  "Afrobeat",
  "Soul",
  "Hip-Hop",
  "Jazz",
  "R&B",
  "Gospel",
  "Coupé-Décalé",
  "Rumba",
];

export default function PublierPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ARTIST")) {
      router.push("/connexion");
    }
  }, [user, loading, router]);

  if (done) {
    return (
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
        <ArtistSidebar active="/dashboard/publier" />
        <div className="lunea-card flex-1 p-8 text-center">
          <p className="font-display text-2xl font-bold text-[var(--accent)]">Chanson publiée</p>
          <p className="mt-2 text-[var(--text-muted)]">MP3 stocké + métadonnées en base</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard/mes-chansons" className="lunea-btn lunea-btn-primary">
              Mes chansons
            </Link>
            <Link href="/musique" className="lunea-btn lunea-btn-ghost">
              Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <ArtistSidebar active="/dashboard/publier" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold">+ Publier une chanson</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          MP3 max {MAX_MP3_MB} Mo · 2 chansons / 7 jours
        </p>

        <form
          className="lunea-card mt-6 space-y-5 p-5 sm:p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/tracks", { method: "POST", body: fd });
            const data = await res.json();
            setBusy(false);
            if (!res.ok) {
              setError(data.error || "Erreur");
              return;
            }
            setDone(true);
          }}
        >
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Fichier audio MP3 *</label>
            <input
              type="file"
              name="audio"
              accept="audio/mpeg,.mp3"
              required
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Pochette</label>
            <input type="file" name="cover" accept="image/*" className="w-full text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Titre</label>
              <input className="lunea-input" required name="title" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Nom d&apos;artiste</label>
              <input className="lunea-input" name="artistName" defaultValue={user?.username || ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Genre</label>
              <select className="lunea-input" name="genre" defaultValue={genres[0]}>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Année</label>
              <input className="lunea-input" type="number" name="year" defaultValue={2026} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Description</label>
            <textarea className="lunea-input min-h-24" name="description" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Tags</label>
            <input className="lunea-input" name="tags" placeholder="amour, nuit" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]">Paroles</label>
            <textarea className="lunea-input min-h-28" name="lyrics" />
          </div>
          <label className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
            <input type="checkbox" required className="mt-1 accent-[var(--accent)]" />
            <span>Je confirme disposer des droits nécessaires pour publier et distribuer ce contenu.</span>
          </label>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="submit" disabled={busy} className="lunea-btn lunea-btn-primary py-3">
            {busy ? "Upload…" : "Publier"}
          </button>
        </form>
      </div>
    </div>
  );
}
