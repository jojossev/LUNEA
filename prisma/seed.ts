import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function appendLedger(params: {
  artistId: string;
  kind: string;
  amount: number;
  note?: string;
}) {
  const last = await prisma.ledgerEntry.findFirst({
    where: { artistId: params.artistId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { entryHash: true },
  });
  const prevHash = last?.entryHash ?? "GENESIS";
  const createdAt = new Date();
  const payload = [
    prevHash,
    params.artistId,
    params.kind,
    Number(params.amount).toFixed(4),
    params.note ?? "",
    createdAt.toISOString(),
  ].join("|");
  const entryHash = createHash("sha256").update(payload).digest("hex");
  return prisma.ledgerEntry.create({
    data: {
      artistId: params.artistId,
      kind: params.kind,
      amount: params.amount,
      note: params.note,
      prevHash,
      entryHash,
      createdAt,
    },
  });
}

async function main() {
  await prisma.ledgerEntry.deleteMany();
  await prisma.report.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.premiumPayment.deleteMany();
  await prisma.listen.deleteMany();
  await prisma.download.deleteMany();
  await prisma.track.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("lunea123", 10);

  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@lunea.app",
      passwordHash,
      role: "ADMIN",
    },
  });

  const artistsData = [
    {
      username: "lunez",
      email: "lunez@lunea.app",
      name: "Lunez",
      slug: "lunez",
      city: "Kinshasa",
      country: "RDC",
      genre: "Afrobeat",
      bio: "Artiste afrobeat de Kinshasa. Mélodies nocturnes et rythmes contemporains.",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      verified: true,
      premiumStatus: "NORMAL",
      virtualRevenue: 1913.8,
      realBalance: 0,
    },
    {
      username: "malaika",
      email: "malaika@lunea.app",
      name: "Malaika Vox",
      slug: "malaika-vox",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      genre: "Soul",
      bio: "Voix soul et R&B. Des histoires d'amour et de résilience.",
      imageUrl: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=400&fit=crop",
      verified: true,
      premiumStatus: "PREMIUM_ACTIVE",
      virtualRevenue: 420,
      realBalance: 428.5,
      premiumDays: 20,
    },
    {
      username: "kofi",
      email: "kofi@lunea.app",
      name: "Kofi Drift",
      slug: "kofi-drift",
      city: "Accra",
      country: "Ghana",
      genre: "Hip-Hop",
      bio: "Rappeur et producteur. Flows précis, beats lourds.",
      imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
      verified: false,
      premiumStatus: "PREMIUM_ACTIVE",
      virtualRevenue: 800,
      realBalance: 612.0,
      premiumDays: 15,
    },
    {
      username: "sira",
      email: "sira@lunea.app",
      name: "Sira Noir",
      slug: "sira-noir",
      city: "Dakar",
      country: "Sénégal",
      genre: "Jazz",
      bio: "Jazz contemporain teinté de mbalax.",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
      verified: false,
      premiumStatus: "NORMAL",
      virtualRevenue: 156.4,
      realBalance: 0,
    },
  ];

  const createdArtists = [];

  for (const a of artistsData) {
    const user = await prisma.user.create({
      data: {
        username: a.username,
        email: a.email,
        passwordHash,
        role: "ARTIST",
      },
    });

    const now = new Date();
    const activated =
      a.premiumStatus === "PREMIUM_ACTIVE"
        ? new Date(now.getTime() - (a.premiumDays ?? 10) * 86400000)
        : null;
    const expires = activated ? new Date(activated.getTime() + 31 * 86400000) : null;

    const artist = await prisma.artist.create({
      data: {
        userId: user.id,
        name: a.name,
        slug: a.slug,
        city: a.city,
        country: a.country,
        genre: a.genre,
        bio: a.bio,
        imageUrl: a.imageUrl,
        verified: a.verified,
        premiumStatus: a.premiumStatus,
        premiumActivatedAt: activated,
        premiumExpiresAt: expires,
        virtualRevenue: a.virtualRevenue,
        realBalance: a.realBalance,
        newcoinAccount: a.premiumStatus === "PREMIUM_ACTIVE" ? `${a.username}.nco` : null,
      },
    });

    if (activated && expires) {
      await prisma.premiumPayment.create({
        data: {
          artistId: artist.id,
          amount: 12,
          newcoinAccount: `${a.username}.nco`,
          createdAt: activated,
          expiresAt: expires,
        },
      });
    }

    createdArtists.push(artist);
  }

  const [lunez, malaika, kofi, sira] = createdArtists;

  const tracksSeed: any[] = [
    { artist: lunez, title: "Aimer encore", genre: "Afrobeat", year: 2025, duration: "3:42", plays: 45200, downloads: 8200, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop", tags: "amour,nuit,afro", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { artist: lunez, title: "Nuit Kin", genre: "Afrobeat", year: 2025, duration: "4:05", plays: 38100, downloads: 7100, cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop", tags: "ville,kinshasa", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { artist: lunez, title: "Brouillon secret", genre: "Afrobeat", year: 2026, duration: "2:40", plays: 0, downloads: 0, cover: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop", tags: "demo", status: "DRAFT", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { artist: malaika, title: "Soleil doux", genre: "Soul", year: 2024, duration: "3:18", plays: 52100, downloads: 11200, cover: "https://images.unsplash.com/photo-1459749411177-0415448067e0?w=400&h=400&fit=crop", tags: "soul,été", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    { artist: malaika, title: "Étoiles", genre: "Soul", year: 2025, duration: "3:55", plays: 27100, downloads: 5600, cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=400&fit=crop", tags: "nuit,rêve", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
    { artist: kofi, title: "Drift Mode", genre: "Hip-Hop", year: 2025, duration: "2:56", plays: 98000, downloads: 22000, cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop", tags: "rap,urbain", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
    { artist: kofi, title: "Pulse", genre: "Hip-Hop", year: 2025, duration: "3:21", plays: 64000, downloads: 15000, cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop", tags: "énergie", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
    { artist: sira, title: "Lagune", genre: "Jazz", year: 2024, duration: "5:12", plays: 18900, downloads: 3400, cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop", tags: "jazz,instrumental", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  ];

  const createdTracks = [];
  for (const t of tracksSeed) {
    const track = await prisma.track.create({
      data: {
        artistId: t.artist.id,
        title: t.title,
        genre: t.genre,
        year: t.year,
        duration: t.duration,
        coverUrl: t.cover,
        tags: t.tags,
        plays: t.plays,
        downloads: t.downloads,
        status: t.status ?? "PUBLISHED",
        audioUrl: t.audio,
      },
    });
    createdTracks.push(track);
  }

  for (const artist of [malaika, kofi]) {
    await appendLedger({
      artistId: artist.id,
      kind: "REAL_LISTEN",
      amount: artist.realBalance * 0.7,
      note: "Écoutes monétisées",
    });
    await appendLedger({
      artistId: artist.id,
      kind: "REAL_DOWNLOAD",
      amount: artist.realBalance * 0.3,
      note: "Téléchargements monétisés",
    });
  }

  await appendLedger({
    artistId: lunez.id,
    kind: "VIRTUAL_LISTEN",
    amount: 1254.3,
    note: "Revenus virtuels (écoutes)",
  });
  await appendLedger({
    artistId: lunez.id,
    kind: "VIRTUAL_DOWNLOAD",
    amount: 656.8,
    note: "Revenus virtuels (téléchargements)",
  });

  await prisma.withdrawal.create({
    data: {
      artistId: kofi.id,
      amount: 500,
      newcoinAccount: "kofi.nco",
      status: "PAID",
    },
  });

  await prisma.withdrawal.create({
    data: {
      artistId: malaika.id,
      amount: 500,
      newcoinAccount: "malaika.nco",
      status: "PENDING",
    },
  });

  const pulse = createdTracks.find((t) => t.title === "Pulse")!;
  await prisma.report.create({
    data: {
      trackId: pulse.id,
      reason: "Violation de droits d'auteur",
      status: "PENDING",
    },
  });

  await prisma.user.create({
    data: {
      username: "sarah",
      email: "sarah@lunea.app",
      passwordHash,
      role: "LISTENER",
    },
  });

  console.log("Seed OK — mot de passe pour tous: lunea123");
  console.log("admin@lunea.app | lunez@lunea.app | malaika@lunea.app | kofi@lunea.app | sarah@lunea.app");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
