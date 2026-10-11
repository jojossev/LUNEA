import Link from "next/link";
import { LuneaLogo } from "@/components/LuneaLogo";

const benefits = [
  "Monétisation des écoutes (0,01 $)",
  "Monétisation des téléchargements (0,02 $)",
  "Solde réel disponible",
  "Demandes de retrait (min. 500 $)",
  "Statistiques avancées",
  "Historique financier",
];

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <div className="lunea-card overflow-hidden">
        <div className="bg-gradient-to-br from-[var(--accent)]/20 via-transparent to-transparent p-8 sm:p-10">
          <div className="mb-4">
            <LuneaLogo href="/" size="md" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Premium</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Transformez votre audience en revenus.
          </h1>
          <p className="mt-4 text-[var(--text-muted)]">
            Publiez gratuitement. Activez Premium pour convertir les nouvelles performances en argent réel.
          </p>
          <p className="mt-6 font-display text-5xl font-bold">
            12 $ <span className="text-lg font-normal text-[var(--text-muted)]">/ mois</span>
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Durée : 31 jours · Paiement via Newcoin</p>
        </div>

        <ul className="space-y-3 border-t border-[var(--border)] px-8 py-6 sm:px-10">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="mt-0.5 text-[var(--accent)]">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--border)] px-8 py-6 sm:px-10">
          <div className="rounded-xl bg-[var(--bg)] p-4 text-sm text-[var(--text-muted)]">
            Important : les revenus générés en mode Normal restent virtuels et ne sont jamais transférés au solde réel.
          </div>
          <Link href="/premium/paiement" className="lunea-btn lunea-btn-primary mt-6 w-full py-3.5 text-base">
            ACTIVER PREMIUM
          </Link>
          <Link href="/dashboard" className="mt-4 block text-center text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
