import Link from "next/link";
import { redirect } from "next/navigation";
import { ArtistSidebar } from "@/components/DashboardUI";
import { formatNumber, getArtistDashboard } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MesChansonsPage() {
  const session = await getSession();
  if (!session?.artistId) redirect("/connexion");
  const artist = await getArtistDashboard(session.artistId);
  const mine = artist?.tracks ?? [];

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <ArtistSidebar active="/dashboard/mes-chansons" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Gestion des chansons</h1>
            <p className="text-sm text-[var(--text-muted)]">{artist?.name}</p>
          </div>
          <Link href="/dashboard/publier" className="lunea-btn lunea-btn-primary">
            + Publier
          </Link>
        </div>

        <div className="lunea-card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium">Genre</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Écoutes</th>
                <th className="px-4 py-3 font-medium">Téléch.</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={t.coverUrl || ""} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <Link href={`/chanson/${t.id}`} className="font-medium hover:text-[var(--accent)]">
                        {t.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{t.genre}</td>
                  <td className="px-4 py-3">{t.status}</td>
                  <td className="px-4 py-3">{formatNumber(t.plays)}</td>
                  <td className="px-4 py-3">{formatNumber(t.downloads)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
