"use client";

import { useAuth } from "@/lib/auth-client";

export function LogoutButton({ className = "" }: { className?: string }) {
  const { logout, user } = useAuth();

  return (
    <button
      type="button"
      onClick={() => logout()}
      className={`w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-left text-sm text-[var(--danger)] transition hover:bg-[var(--card-hover)] ${className}`}
    >
      Déconnexion{user?.username ? ` (@${user.username})` : ""}
    </button>
  );
}
