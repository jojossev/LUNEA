import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/DashboardUI";
import { ModerationActions } from "@/components/ModerationActions";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/connexion");

  const reports = await prisma.report.findMany({
    include: { track: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <AdminSidebar active="/admin/moderation" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold">Modération</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Signalements & actions</p>
        <ModerationActions reports={reports} />
      </div>
    </div>
  );
}
