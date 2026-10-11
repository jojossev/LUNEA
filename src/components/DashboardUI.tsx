import Link from "next/link";
import { LuneaMark } from "@/components/LuneaLogo";
import { LogoutButton } from "@/components/LogoutButton";

const artistLinks = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/dashboard/mes-chansons", label: "Mes chansons" },
  { href: "/dashboard/publier", label: "Publier" },
  { href: "/dashboard/portefeuille", label: "Portefeuille" },
  { href: "/premium", label: "Premium" },
  { href: "/dashboard/retrait", label: "Retrait" },
];

export function ArtistSidebar({ active }: { active?: string }) {
  return (
    <aside className="lunea-card hidden h-fit w-56 shrink-0 p-4 lg:block">
      <div className="mb-6">
        <LuneaMark />
      </div>
      <p className="mb-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">Espace artiste</p>
      <nav className="flex flex-col gap-1">
        {artistLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-3 py-2.5 text-sm transition ${
              active === link.href
                ? "bg-[var(--accent-muted)] font-semibold text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="mt-6 block rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        ← Retour au site
      </Link>
      <div className="mt-3">
        <LogoutButton />
      </div>
    </aside>
  );
}

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/artistes", label: "Artistes" },
  { href: "/admin/chansons", label: "Chansons" },
  { href: "/admin/moderation", label: "Modération" },
];

export function AdminSidebar({ active }: { active?: string }) {
  return (
    <>
      <div className="fixed right-4 top-4 z-50 lg:hidden">
        <LogoutButton className="w-auto bg-[var(--card)] px-4 py-2 shadow-lg" />
      </div>

      <aside className="lunea-card hidden h-fit w-56 shrink-0 p-4 lg:block">
        <div className="mb-4">
          <LuneaMark />
        </div>
        <p className="mb-4 text-xs uppercase tracking-wider text-[var(--text-muted)]">Administration</p>
        <nav className="flex flex-col gap-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2.5 text-sm transition ${
                active === link.href
                  ? "bg-[var(--accent-muted)] font-semibold text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--card-hover)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-6 block rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
          ← Retour au site
        </Link>
        <div className="mt-3">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}


export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="lunea-card p-4 sm:p-5">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      {hint && <p className="mt-2 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

export function MiniChart({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data);
  return (
    <div className="lunea-card p-5">
      <p className="mb-4 text-sm text-[var(--text-muted)]">{label}</p>
      <div className="flex h-40 items-end gap-1.5">
        {data.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-[var(--accent)]/80 transition hover:bg-[var(--accent)]"
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
