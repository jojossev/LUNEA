import Link from "next/link";
import { redirect } from "next/navigation";
import { ArtistSidebar } from "@/components/DashboardUI";
import { formatMoney, getArtistDashboard } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PortefeuillePage() {
  const session = await getSession();
  if (!session?.artistId) redirect("/connexion");
  const artist = await getArtistDashboard(session.artistId);
  if (!artist) redirect("/dashboard");

  const history = [
    ...artist.ledgerEntries.map((e) => ({
      id: e.id,
      date: e.createdAt.toLocaleDateString("fr-FR"),
      type: e.kind,
      amount: e.amount,
      status: e.note || "",
    })),
  ].slice(0, 25);

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <ArtistSidebar active="/dashboard/portefeuille" />
      <div className="min-w-0 flex-1 space-y-6">
        <h1 className="font-display text-2xl font-bold">Portefeuille</h1>
        <div className="lunea-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Solde disponible</p>
            <p className="font-display text-3xl font-bold text-[var(--accent)]">
              {formatMoney(artist.realBalance)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Virtuel historique : {formatMoney(artist.virtualRevenue)} (non retirable)
            </p>
          </div>
          <Link href="/dashboard/retrait" className="lunea-btn lunea-btn-primary">
            Demander un retrait
          </Link>
        </div>

        <div className="lunea-card overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.type}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      row.amount < 0 ? "text-[var(--danger)]" : "text-[var(--accent)]"
                    }`}
                  >
                    {formatMoney(row.amount)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
