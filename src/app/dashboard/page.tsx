import Link from "next/link";
import { redirect } from "next/navigation";
import { ArtistSidebar, MiniChart, StatCard } from "@/components/DashboardUI";
import { formatMoney, formatNumber, getArtistDashboard } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardNormalPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.role !== "ARTIST" || !session.artistId) redirect("/");

  const artist = await getArtistDashboard(session.artistId);
  if (!artist) redirect("/");

  if (artist.premiumStatus === "PREMIUM_ACTIVE") {
    redirect("/dashboard/premium");
  }

  const plays = artist.tracks.reduce((s, t) => s + t.plays, 0);
  const downloads = artist.tracks.reduce((s, t) => s + t.downloads, 0);
  const chart = [12, 18, 15, 22, 28, 25, 32, 30, 40, 38, 45, 52];

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <ArtistSidebar active="/dashboard" />
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Tableau de bord</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {artist.name} · Mode Normal · @{session.username}
            </p>
          </div>
          <Link href="/dashboard/publier" className="lunea-btn lunea-btn-primary px-3 py-2 text-sm">
            + Publier
          </Link>
        </div>

        <div className="lunea-card border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent-muted)] to-transparent p-5">
          <p className="font-display text-lg font-bold">
            Revenus théoriques : {formatMoney(artist.virtualRevenue)}
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Ces revenus sont virtuels. Ils ne sont pas disponibles au retrait.
          </p>
          <Link href="/premium" className="lunea-btn lunea-btn-primary mt-4">
            Activer Premium — 12 $/mois
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Écoutes totales" value={formatNumber(plays)} />
          <StatCard label="Téléchargements" value={formatNumber(downloads)} />
          <StatCard label="Revenus virtuels" value={formatMoney(artist.virtualRevenue)} />
          <StatCard label="Solde disponible" value={formatMoney(artist.realBalance)} />
        </div>

        <MiniChart data={chart} label="Performances (indicatif)" />
      </div>
    </div>
  );
}
