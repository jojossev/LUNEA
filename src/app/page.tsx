import Link from "next/link";
import { TrackCard } from "@/components/TrackCard";
import { LuneaLogo } from "@/components/LuneaLogo";
import { formatNumber, genres, getArtists, getPublishedTracks } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allTracks, artists] = await Promise.all([getPublishedTracks(), getArtists()]);
  const trending = allTracks.slice(0, 6);
  const newest = [...allTracks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  const mostDownloaded = [...allTracks].sort((a, b) => b.downloads - a.downloads).slice(0, 5);

  const artistsWithStats = artists.map((a) => ({
    ...a,
    songsCount: a._count.tracks,
    plays: a.tracks.reduce((s, t) => s + t.plays, 0),
    image: a.imageUrl || "/logo-lunea.png",
  }));

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1600&h=900&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/90 to-[var(--bg)]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]/50" />

        <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-14 pt-20 md:min-h-[440px] md:px-6 md:pb-16 md:pt-28">
          <div className="animate-fade-up mb-4">
            <LuneaLogo href="" size="hero" className="max-w-[280px] drop-shadow-lg sm:max-w-[340px]" />
          </div>
          <h1 className="animate-fade-up animate-delay-1 max-w-2xl font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            Découvrez, écoutez et téléchargez gratuitement votre musique préférée
          </h1>
          <form action="/recherche" className="animate-fade-up animate-delay-2 mt-8 max-w-xl">
            <div className="flex gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-2 backdrop-blur">
              <input
                name="q"
                placeholder="Rechercher une chanson ou un artiste"
                className="lunea-input flex-1 border-0 bg-transparent py-3"
              />
              <button type="submit" className="lunea-btn lunea-btn-primary shrink-0 px-5">
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 md:px-6">
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Tendances</h2>
            <Link href="/musique" className="text-sm text-[var(--accent)] hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {trending.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">Nouvelles chansons</h2>
              <div className="lunea-card divide-y divide-[var(--border)] p-2">
                {newest.map((track, i) => (
                  <div key={track.id} className="flex items-center gap-3 px-2 py-3">
                    <span className="w-6 text-[var(--text-muted)]">{i + 1}</span>
                    <img src={track.cover} alt="" className="h-11 w-11 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/chanson/${track.id}`} className="block truncate font-medium hover:text-[var(--accent)]">
                        {track.title}
                      </Link>
                      <p className="truncate text-sm text-[var(--text-muted)]">{track.artistName}</p>
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">{track.duration}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">Plus téléchargées</h2>
              <div className="lunea-card divide-y divide-[var(--border)] p-2">
                {mostDownloaded.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 px-2 py-3">
                    <img src={track.cover} alt="" className="h-11 w-11 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/chanson/${track.id}`} className="block truncate font-medium hover:text-[var(--accent)]">
                        {track.title}
                      </Link>
                      <p className="text-sm text-[var(--text-muted)]">
                        {formatNumber(track.downloads)} téléchargements
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section>
              <h2 className="mb-4 font-display text-xl font-bold">Artistes populaires</h2>
              <div className="space-y-3">
                {artistsWithStats.slice(0, 4).map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artiste/${artist.slug}`}
                    className="lunea-card flex items-center gap-3 p-3 transition hover:bg-[var(--card-hover)]"
                  >
                    <img src={artist.image} alt="" className="h-12 w-12 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{artist.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{artist.songsCount} chansons</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/artistes" className="mt-3 inline-block text-sm text-[var(--accent)]">
                Voir tous les artistes →
              </Link>
            </section>

            <section>
              <h2 className="mb-4 font-display text-xl font-bold">Genres musicaux</h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <Link
                    key={g}
                    href={`/genres?g=${encodeURIComponent(g)}`}
                    className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            </section>

            <section className="lunea-card bg-gradient-to-br from-[var(--accent-muted)] to-transparent p-5">
              <p className="font-display text-lg font-bold">Vous êtes artiste ?</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Publiez gratuitement. Passez Premium. Gagnez grâce à vos écoutes.
              </p>
              <Link href="/premium" className="lunea-btn lunea-btn-primary mt-4 w-full">
                Découvrir Premium
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
