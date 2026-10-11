import { NextResponse } from "next/server";
import { getPublishedTracks } from "@/lib/data";

export async function GET() {
  const tracks = await getPublishedTracks();
      return NextResponse.json({
    tracks: tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artistId: t.artistId,
      artistName: t.artistName,
      genre: t.genre,
      year: t.year,
      duration: t.duration,
      plays: t.plays,
      downloads: t.downloads,
      cover: t.cover,
      audioUrl: t.audioUrl,
    })),
  });
}
