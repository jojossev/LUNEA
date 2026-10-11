import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireArtistSession } from "@/lib/session";

function bucketCounts(
  dates: Date[],
  days: number
): { label: string; value: number }[] {
  const now = new Date();
  const out: { label: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = dates.filter((x) => x >= d && x < next).length;
    out.push({
      label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      value: count,
    });
  }
  return out;
}

export async function GET(req: Request) {
  try {
    const session = await requireArtistSession();
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "month"; // day | week | month

    const days = range === "day" ? 1 : range === "week" ? 7 : 30;
    const since = new Date(Date.now() - days * 86400000);

    const [listens, downloads] = await Promise.all([
      prisma.listen.findMany({
        where: { artistId: session.artistId!, createdAt: { gte: since }, monetized: true },
        select: { createdAt: true, amount: true },
      }),
      prisma.download.findMany({
        where: { artistId: session.artistId!, createdAt: { gte: since }, monetized: true },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const listenDates = listens.map((l) => l.createdAt);
    const downloadDates = downloads.map((d) => d.createdAt);
    const byDay = bucketCounts([...listenDates, ...downloadDates], Math.min(days, 30));

    const revenue =
      listens.reduce((s, l) => s + l.amount, 0) + downloads.reduce((s, d) => s + d.amount, 0);

    const byTrack = await prisma.track.findMany({
      where: { artistId: session.artistId!, status: "PUBLISHED" },
      select: { id: true, title: true, coverUrl: true, plays: true, downloads: true },
    });

    return NextResponse.json({
      range,
      listens: listens.length,
      downloads: downloads.length,
      revenue,
      byDay,
      byTrack: byTrack.map((t) => ({
        ...t,
        estimated: t.plays * 0.01 * 0.1 + t.downloads * 0.02 * 0.1,
      })),
    });
  } catch (e) {
    if (e instanceof Error && (e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN_ARTIST")) {
      return NextResponse.json({ error: "Artiste requis" }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
