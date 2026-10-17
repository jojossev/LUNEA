import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { GlobalPlayer, PlayerProvider } from "@/components/GlobalPlayer";
import { AuthProvider } from "@/lib/auth-client";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUNEA — Découvrez, écoutez et téléchargez",
  description:
    "Plateforme musicale : publiez gratuitement, passez Premium, gagnez grâce à vos écoutes et téléchargements.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AuthProvider>
          <PlayerProvider>
            <SiteHeader />
            <main className="pb-28">{children}</main>
            <GlobalPlayer />
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
