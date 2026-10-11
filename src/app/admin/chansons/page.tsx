import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/DashboardUI";
import { AdminTracksTable } from "@/components/AdminTracksTable";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminChansonsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/connexion");

  const tracks = await prisma.track.findMany({
    include: { artist: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <AdminSidebar active="/admin/chansons" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold">Gestion des chansons</h1>
        <AdminTracksTable
          tracks={tracks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            plays: t.plays,
            artistName: t.artist.name,
          }))}
        />
      </div>
    </div>
  );
}
