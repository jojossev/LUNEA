import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminSidebar, StatCard } from "@/components/DashboardUI";
import { formatMoney, formatNumber, getAdminStats } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/connexion");

  const s = await getAdminStats();

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <AdminSidebar active="/admin" />
      <div className="min-w-0 flex-1 space-y-6">
        <h1 className="font-display text-2xl font-bold">Administration</h1>
        <p className="text-sm text-[var(--text-muted)]">Connecté : @{session.username}</p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Utilisateurs" value={formatNumber(s.users)} />
          <StatCard label="Artistes" value={formatNumber(s.artists)} />
          <StatCard label="Artistes Premium" value={formatNumber(s.premiumArtists)} />
          <StatCard label="Chansons" value={formatNumber(s.songs)} />
          <StatCard label="Écoutes" value={formatNumber(s.plays)} />
          <StatCard label="Téléchargements" value={formatNumber(s.downloads)} />
          <StatCard label="Revenus abonnements" value={formatMoney(s.subscriptionRevenue)} />
          <StatCard label="Montants dus artistes" value={formatMoney(s.owedToArtists)} />
        </div>

        <div className="lunea-card p-5">
          <p className="text-sm text-[var(--text-muted)]">Retraits en attente</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--warning)]">
            {s.pendingWithdrawals}
          </p>
          <Link href="/admin/moderation" className="mt-3 inline-block text-sm text-[var(--accent)]">
            Modération →
          </Link>
        </div>
      </div>
    </div>
  );
}
