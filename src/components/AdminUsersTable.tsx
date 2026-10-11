"use client";

import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
};

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();

  async function setStatus(userId: string, status: "Actif" | "Suspendu") {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    });
    router.refresh();
  }

  return (
    <div className="lunea-card mt-6 overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-[var(--border)] text-[var(--text-muted)]">
          <tr>
            <th className="px-4 py-3">Pseudo</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Rôle</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-3 font-medium">{u.username}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{u.email}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3">
                <span className={u.status === "Actif" ? "text-[var(--accent)]" : "text-[var(--danger)]"}>
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {u.role !== "ADMIN" &&
                  (u.status === "Actif" ? (
                    <button
                      type="button"
                      className="text-[var(--danger)] hover:underline"
                      onClick={() => setStatus(u.id, "Suspendu")}
                    >
                      Suspendre
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-[var(--accent)] hover:underline"
                      onClick={() => setStatus(u.id, "Actif")}
                    >
                      Réactiver
                    </button>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
