import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/DashboardUI";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/connexion");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:px-6">
      <AdminSidebar active="/admin/utilisateurs" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold">Gestion des utilisateurs</h1>
        <AdminUsersTable users={users} />
      </div>
    </div>
  );
}
