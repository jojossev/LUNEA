import Link from "next/link";
import { redirect } from "next/navigation";
import { ArtistSidebar, StatCard } from "@/components/DashboardUI";
import { ArtistStatsPanel } from "@/components/ArtistStatsPanel";
import { formatMoney, formatNumber, getArtistDashboard } from "@/lib/data";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPremiumPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.role !== "ARTIST" || !session.artistId) redirect("/");

  const artist = await getArtistDashboard(session.artistId);
  if (!artist) redirect("/");
  if (artist.premiumStatus !== "PREMIUM_ACTIVE") redirect("/dashboard");

  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const [monthListens, monthDownloads] = await Promise.all([
    prisma.listen.count({
      where: { artistId: artist.id, monetized: true, createdAt: { gte: monthAgo } },
    }),
    prisma.download.count({
      where: { artistId: artist.id, monetized: true, createdAt: { gte: monthAgo } },
    }),
  ]);
  const monthRevenue = monthListens * 0.01 + monthDownloads * 0.02;
  const published = artist.tracks.filter((t) => t.status === "PUBLISHED");

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <ArtistSidebar active="/dashboard" />
      <div className="min-w-0 flex-1 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            PREMIUM ACTIF
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Dashboard Premium — {artist.name}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Expire le {artist.premiumExpiresAt?.toLocaleDateString("fr-FR") ?? "—"}
          </p>
        </div>

        <div className="lunea-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Solde disponible</p>
            <p className="font-display text-4xl font-bold text-[var(--accent)]">
              {formatMoney(artist.realBalance)}
            </p>
          </div>
          <Link href="/dashboard/retrait" className="lunea-btn lunea-btn-primary px-6 py-3">
            Retirer mes revenus
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Écoutes rémunérées (30j)" value={formatNumber(monthListens)} />
          <StatCard label="Téléchargements rémunérés (30j)" value={formatNumber(monthDownloads)} />
          <StatCard label="Revenus (30j)" value={formatMoney(monthRevenue)} />
        </div>

        <ArtistStatsPanel />

        <section className="lunea-card p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Revenus par chanson (estim.)</h2>
          <div className="space-y-3">
            {published.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img src={t.coverUrl || ""} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="truncate font-medium">{t.title}</span>
                </div>
                <span className="shrink-0 text-[var(--accent)]">
                  {formatMoney(t.plays * 0.01 * 0.1 + t.downloads * 0.02 * 0.1)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <p className="text-sm text-[var(--text-muted)]">
          Revenus virtuels historiques (non payables) : {formatMoney(artist.virtualRevenue)}
        </p>
      </div>
    </div>
  );
}
