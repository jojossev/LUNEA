export type Artist = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  genre: string;
  bio: string;
  songsCount: number;
  plays: number;
  downloads: number;
  verified?: boolean;
  image: string;
};

export type Track = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  genre: string;
  year: number;
  duration: string;
  plays: number;
  downloads: number;
  cover: string;
  status: "Publié" | "Brouillon" | "Masqué";
  tags: string[];
};

export const artists: Artist[] = [
  {
    id: "1",
    name: "Lunez",
    slug: "lunez",
    city: "Kinshasa",
    country: "RDC",
    genre: "Afrobeat",
    bio: "Artiste afrobeat de Kinshasa. Mélodies nocturnes et rythmes contemporains.",
    songsCount: 12,
    plays: 125430,
    downloads: 32840,
    verified: true,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Malaika Vox",
    slug: "malaika-vox",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    genre: "Soul",
    bio: "Voix soul et R&B. Des histoires d'amour et de résilience.",
    songsCount: 8,
    plays: 89200,
    downloads: 21400,
    verified: true,
    image: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Kofi Drift",
    slug: "kofi-drift",
    city: "Accra",
    country: "Ghana",
    genre: "Hip-Hop",
    bio: "Rappeur et producteur. Flows précis, beats lourds.",
    songsCount: 15,
    plays: 210500,
    downloads: 45100,
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "Sira Noir",
    slug: "sira-noir",
    city: "Dakar",
    country: "Sénégal",
    genre: "Jazz",
    bio: "Jazz contemporain teinté de mbalax.",
    songsCount: 6,
    plays: 45200,
    downloads: 9800,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
  },
];

export const tracks: Track[] = [
  {
    id: "t1",
    title: "Aimer encore",
    artistId: "1",
    artistName: "Lunez",
    genre: "Afrobeat",
    year: 2025,
    duration: "3:42",
    plays: 45200,
    downloads: 8200,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    status: "Publié",
    tags: ["amour", "nuit", "afro"],
  },
  {
    id: "t2",
    title: "Nuit Kin",
    artistId: "1",
    artistName: "Lunez",
    genre: "Afrobeat",
    year: 2025,
    duration: "4:05",
    plays: 38100,
    downloads: 7100,
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    status: "Publié",
    tags: ["ville", "kinshasa"],
  },
  {
    id: "t3",
    title: "Soleil doux",
    artistId: "2",
    artistName: "Malaika Vox",
    genre: "Soul",
    year: 2024,
    duration: "3:18",
    plays: 52100,
    downloads: 11200,
    cover: "https://images.unsplash.com/photo-1459749411177-0415448067e0?w=400&h=400&fit=crop",
    status: "Publié",
    tags: ["soul", "été"],
  },
  {
    id: "t4",
    title: "Drift Mode",
    artistId: "3",
    artistName: "Kofi Drift",
    genre: "Hip-Hop",
    year: 2025,
    duration: "2:56",
    plays: 98000,
    downloads: 22000,
    cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
    status: "Publié",
    tags: ["rap", "urbain"],
  },
  {
    id: "t5",
    title: "Lagune",
    artistId: "4",
    artistName: "Sira Noir",
    genre: "Jazz",
    year: 2024,
    duration: "5:12",
    plays: 18900,
    downloads: 3400,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    status: "Publié",
    tags: ["jazz", "instrumental"],
  },
  {
    id: "t6",
    title: "Étoiles",
    artistId: "2",
    artistName: "Malaika Vox",
    genre: "Soul",
    year: 2025,
    duration: "3:55",
    plays: 27100,
    downloads: 5600,
    cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=400&fit=crop",
    status: "Publié",
    tags: ["nuit", "rêve"],
  },
  {
    id: "t7",
    title: "Pulse",
    artistId: "3",
    artistName: "Kofi Drift",
    genre: "Hip-Hop",
    year: 2025,
    duration: "3:21",
    plays: 64000,
    downloads: 15000,
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
    status: "Publié",
    tags: ["énergie"],
  },
  {
    id: "t8",
    title: "Brouillon secret",
    artistId: "1",
    artistName: "Lunez",
    genre: "Afrobeat",
    year: 2026,
    duration: "2:40",
    plays: 0,
    downloads: 0,
    cover: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop",
    status: "Brouillon",
    tags: ["demo"],
  },
];

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

export const artistDashboardNormal = {
  plays: 125430,
  downloads: 32840,
  virtualRevenue: 1913.8,
  realBalance: 0,
  chart: [12, 18, 15, 22, 28, 25, 32, 30, 40, 38, 45, 52],
};

export const artistDashboardPremium = {
  plays: 125430,
  downloads: 32840,
  virtualRevenue: 1913.8,
  realBalance: 428.5,
  monthPlays: 18200,
  monthDownloads: 3400,
  monthRevenue: 250,
  chart: [8, 12, 10, 18, 22, 20, 28, 35, 30, 42, 48, 55],
};

export const walletHistory = [
  { id: "w1", date: "12 Sep 2026", type: "Écoutes", amount: 182.0, status: "Crédité" },
  { id: "w2", date: "10 Sep 2026", type: "Téléchargements", amount: 68.0, status: "Crédité" },
  { id: "w3", date: "01 Sep 2026", type: "Écoutes", amount: 120.5, status: "Crédité" },
  { id: "w4", date: "28 Aoû 2026", type: "Retrait", amount: -500.0, status: "Payé" },
];

export const adminStats = {
  users: 18420,
  artists: 1240,
  premiumArtists: 186,
  songs: 8920,
  plays: 4520000,
  downloads: 890000,
  premiumRevenue: 2232,
  owedToArtists: 18450,
  pendingWithdrawals: 7,
  subscriptionRevenue: 2232,
};

export const adminUsers = [
  { id: "u1", name: "sarah.k", email: "sarah@mail.com", role: "Auditeur", status: "Actif" },
  { id: "u2", name: "lunez", email: "lunez@mail.com", role: "Artiste", status: "Actif" },
  { id: "u3", name: "kofi.d", email: "kofi@mail.com", role: "Artiste Premium", status: "Actif" },
  { id: "u4", name: "spam.bot", email: "spam@mail.com", role: "Auditeur", status: "Suspendu" },
];

export const reports = [
  { id: "r1", track: "Pulse", reason: "Violation de droits d'auteur", status: "En attente" },
  { id: "r2", track: "Nuit Kin", reason: "Contenu offensant", status: "En traitement" },
  { id: "r3", track: "Lagune", reason: "Spam", status: "Résolu" },
];

export function formatNumber(n: number) {
  return n.toLocaleString("fr-FR");
}

export function formatMoney(n: number) {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

export function getArtist(id: string) {
  return artists.find((a) => a.id === id || a.slug === id);
}

export function getTrack(id: string) {
  return tracks.find((t) => t.id === id);
}

export function getTracksByArtist(artistId: string) {
  return tracks.filter((t) => t.artistId === artistId);
}
