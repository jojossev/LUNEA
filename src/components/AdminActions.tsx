"use client";

import { useRouter } from "next/navigation";

export function UserStatusButton({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const router = useRouter();
  const next = status === "Actif" ? "Suspendu" : "Actif";

  return (
    <button
      type="button"
      className="text-sm text-[var(--accent)] hover:underline"
      onClick={async () => {
        await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, status: next }),
        });
        router.refresh();
      }}
    >
      {status === "Actif" ? "Suspendre" : "Réactiver"}
    </button>
  );
}

export function ArtistAdminActions({
  artistId,
  verified,
  userStatus,
}: {
  artistId: string;
  verified: boolean;
  userStatus?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <button
        type="button"
        className="lunea-btn lunea-btn-ghost px-3 py-1.5"
        onClick={async () => {
          await fetch("/api/admin/artists", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ artistId, verified: !verified }),
          });
          router.refresh();
        }}
      >
        {verified ? "Retirer vérif." : "Vérifier"}
      </button>
      <button
        type="button"
        className="lunea-btn lunea-btn-ghost px-3 py-1.5"
        onClick={async () => {
          await fetch("/api/admin/artists", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              artistId,
              suspendUser: userStatus !== "Suspendu",
            }),
          });
          router.refresh();
        }}
      >
        {userStatus === "Suspendu" ? "Réactiver" : "Suspendre"}
      </button>
    </div>
  );
}

export function TrackAdminActions({
  trackId,
  status,
}: {
  trackId: string;
  status: string;
}) {
  const router = useRouter();

  async function setStatus(next: string) {
    await fetch("/api/admin/tracks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId, status: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-[var(--text-muted)]">
      {status !== "HIDDEN" && (
        <button type="button" className="hover:text-[var(--warning)]" onClick={() => setStatus("HIDDEN")}>
          Masquer
        </button>
      )}
      {status === "HIDDEN" && (
        <button type="button" className="hover:text-[var(--accent)]" onClick={() => setStatus("PUBLISHED")}>
          Publier
        </button>
      )}
      <button type="button" className="hover:text-[var(--danger)]" onClick={() => setStatus("SUSPENDED")}>
        Suspendre
      </button>
    </div>
  );
}
