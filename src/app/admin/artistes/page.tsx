import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/DashboardUI";
import { AdminArtistsList } from "@/components/AdminArtistsList";
import { getArtists } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminArtistesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/connexion");

  const artists = await getArtists();
  const rows = artists.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    city: a.city,
    verified: a.verified,
    premiumStatus: a.premiumStatus,
    imageUrl: a.imageUrl,
    plays: a.tracks.reduce((s, t) => s + t.plays, 0),
    songsCount: a._count.tracks,
  }));

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <AdminSidebar active="/admin/artistes" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold">Gestion des artistes</h1>
        <AdminArtistsList artists={rows} />
      </div>
    </div>
  );
}
