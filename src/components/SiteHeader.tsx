"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LuneaMark } from "@/components/LuneaLogo";
import { useAuth } from "@/lib/auth-client";

const nav = [
  { href: "/", label: "Accueil" },
  { href: "/musique", label: "Musique" },
  { href: "/artistes", label: "Artistes" },
  { href: "/genres", label: "Genres" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (isDashboard) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 md:gap-4 md:px-6">
        <LuneaMark />

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action="/recherche" className="ml-auto hidden min-w-0 flex-1 max-w-md lg:block">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              ⌕
            </span>
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une chanson ou un artiste"
              className="lunea-input pl-9 py-2.5 text-sm"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/recherche"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] lg:hidden sm:h-10 sm:w-10"
            aria-label="Recherche"
          >
            ⌕
          </Link>

          {!loading && user ? (
            <>
              {user.role === "ARTIST" && (
                <Link href="/dashboard" className="lunea-btn lunea-btn-ghost hidden px-3 py-2 text-xs sm:inline-flex sm:text-sm">
                  Dashboard
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="lunea-btn lunea-btn-ghost hidden px-3 py-2 text-xs sm:inline-flex sm:text-sm">
                  Admin
                </Link>
              )}
              <span className="hidden text-xs text-[var(--text-muted)] sm:inline sm:text-sm">@{user.username}</span>
              <button type="button" onClick={() => logout()} className="lunea-btn lunea-btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="lunea-btn lunea-btn-ghost hidden px-3 py-2 text-xs sm:inline-flex sm:text-sm">
                Connexion
              </Link>
              <Link href="/inscription" className="lunea-btn lunea-btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm">
                Inscription
              </Link>
            </>
          )}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] md:hidden sm:h-10 sm:w-10"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-[var(--text-muted)] hover:bg-[var(--card)]"
              >
                {item.label}
              </Link>
            ))}
            {user?.role === "ARTIST" && (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-[var(--accent)]">
                Dashboard
              </Link>
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
            {!loading && user ? (
              <>
                <span className="text-sm text-[var(--text-muted)]">@{user.username}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="lunea-btn lunea-btn-primary w-full"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setOpen(false)}
                  className="lunea-btn lunea-btn-ghost w-full text-center"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setOpen(false)}
                  className="lunea-btn lunea-btn-primary w-full"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
