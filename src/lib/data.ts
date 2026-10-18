import type { Artist, Track } from "@prisma/client";
import { prisma } from "./db";

export const RATE_LISTEN = 0.01;
export const RATE_DOWNLOAD = 0.02;

export const genres = [
  "Afrobeat",
  "Soul",
  "Hip-Hop",
  "Jazz",
  "R&B",
  "Gospel",
  "Coupé-Décalé",
  "Rumba",
];

export function formatNumber(n: number) {
  return n.toLocaleString("fr-FR");
}

export function formatMoney(n: number) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

export function isPremiumActive(artist: Pick<Artist, "premiumStatus" | "premiumExpiresAt">) {
  if (artist.premiumStatus !== "PREMIUM_ACTIVE") return false;
  if (!artist.premiumExpiresAt) return true;
  return artist.premiumExpiresAt.getTime() > Date.now();
}

export type TrackWithArtist = Track & {
  artist: { id: string; name: string; slug: string };
  artistName: string;
  cover: string;
  tagsList: string[];
  statusLabel: string;
  description?: string | null;
  lyrics?: string | null;
};

function mapTrack(t: Track & { artist: { id: string; name: string; slug: string } }): TrackWithArtist {
  return {
    ...t,
    artistName: t.artist.name,
    cover: t.coverUrl || "/logo-lunea.png",
    tagsList: t.tags ? t.tags.split(",").map((x) => x.trim()).filter(Boolean) : [],
    statusLabel:
      t.status === "PUBLISHED"
        ? "Publié"
        : t.status === "DRAFT"
          ? "Brouillon"
          : t.status === "HIDDEN"
            ? "Masqué"
            : "Suspendu",
    description: t.description,
    lyrics: t.lyrics,
  };
}

export async function getPublishedTracks() {
  const rows = await prisma.track.findMany({
    where: { status: "PUBLISHED" },
    include: { artist: { select: { id: true, name: true, slug: true } } },
    orderBy: { plays: "desc" },
  });
  return rows.map(mapTrack);
}

export async function getTrackById(id: string) {
  const row = await prisma.track.findUnique({
    where: { id },
    include: { artist: { select: { id: true, name: true, slug: true } } },
  });
  if (!row) return null;
  const mapped = mapTrack(row);
  return {
    ...mapped,
    description: row.description,
    lyrics: row.lyrics,
  };
}

export async function getArtists() {
  return prisma.artist.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { tracks: true } },
      tracks: { where: { status: "PUBLISHED" }, select: { plays: true, downloads: true } },
    },
  });
}

export async function getArtistByIdOrSlug(idOrSlug: string) {
  const artist = await prisma.artist.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: {
      tracks: {
        include: { artist: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      },
      user: { select: { email: true, username: true } },
    },
  });
  if (!artist) return null;

  const plays = artist.tracks.reduce((s, t) => s + t.plays, 0);
  const downloads = artist.tracks.reduce((s, t) => s + t.downloads, 0);
  const songsCount = artist.tracks.filter((t) => t.status === "PUBLISHED").length;

  return {
    ...artist,
    plays,
    downloads,
    songsCount,
    image: artist.imageUrl || "/logo-lunea.png",
    mappedTracks: artist.tracks.map(mapTrack),
  };
}

export async function searchCatalog(q: string) {
  const query = q.trim();
  if (!query) {
    return {
      tracks: await getPublishedTracks(),
      artists: await getArtists(),
    };
  }

  const [tracks, artists] = await Promise.all([
    prisma.track.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { genre: { contains: query } },
          { tags: { contains: query } },
          { artist: { name: { contains: query } } },
        ],
      },
      include: { artist: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.artist.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { genre: { contains: query } },
          { city: { contains: query } },
        ],
      },
      include: {
        _count: { select: { tracks: true } },
        tracks: { where: { status: "PUBLISHED" }, select: { plays: true, downloads: true } },
      },
    }),
  ]);

  return { tracks: tracks.map(mapTrack), artists };
}

export async function getAdminStats() {
  const [users, artists, premiumArtists, songs, playsAgg, downloadsAgg, premiumRevenue, owed, pendingWithdrawals] =
    await Promise.all([
      prisma.user.count(),
      prisma.artist.count(),
      prisma.artist.count({ where: { premiumStatus: "PREMIUM_ACTIVE" } }),
      prisma.track.count(),
      prisma.track.aggregate({ _sum: { plays: true } }),
      prisma.track.aggregate({ _sum: { downloads: true } }),
      prisma.premiumPayment.aggregate({ _sum: { amount: true } }),
      prisma.artist.aggregate({ _sum: { realBalance: true } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
    ]);

  return {
    users,
    artists,
    premiumArtists,
    songs,
    plays: playsAgg._sum.plays ?? 0,
    downloads: downloadsAgg._sum.downloads ?? 0,
    subscriptionRevenue: premiumRevenue._sum.amount ?? 0,
    owedToArtists: owed._sum.realBalance ?? 0,
    pendingWithdrawals,
  };
}

export async function getDemoArtistSession(preferPremium = false) {
  return prisma.artist.findFirst({
    where: preferPremium
      ? { premiumStatus: "PREMIUM_ACTIVE" }
      : { premiumStatus: "NORMAL" },
    include: {
      tracks: {
        include: { artist: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      },
      ledgerEntries: { orderBy: { createdAt: "desc" }, take: 20 },
      withdrawals: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getArtistDashboard(artistId: string) {
  return prisma.artist.findUnique({
    where: { id: artistId },
    include: {
      tracks: {
        include: { artist: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      },
      ledgerEntries: { orderBy: { createdAt: "desc" }, take: 30 },
      withdrawals: { orderBy: { createdAt: "desc" } },
    },
  });
}
