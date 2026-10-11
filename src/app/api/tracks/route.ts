import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireArtistSession } from "@/lib/session";
import {
  MAX_COVER_BYTES,
  MAX_MP3_BYTES,
  isMp3Buffer,
  saveUpload,
  sha256Buffer,
} from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const session = await requireArtistSession();
    const form = await req.formData();

    const title = String(form.get("title") || "").trim();
    const genre = String(form.get("genre") || "").trim();
    const year = Number(form.get("year")) || new Date().getFullYear();
    const description = String(form.get("description") || "");
    const tags = String(form.get("tags") || "");
    const lyrics = String(form.get("lyrics") || "");
    const artistName = String(form.get("artistName") || "").trim();
    const audio = form.get("audio");
    const cover = form.get("cover");

    if (!title || !genre) {
      return NextResponse.json({ error: "Titre et genre requis" }, { status: 400 });
    }
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "Fichier MP3 requis" }, { status: 400 });
    }

    const audioBuf = Buffer.from(await audio.arrayBuffer());
    if (audioBuf.length > MAX_MP3_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_MP3_BYTES / (1024 * 1024)} Mo)` },
        { status: 400 }
      );
    }
    if (!isMp3Buffer(audioBuf) && !audio.name.toLowerCase().endsWith(".mp3") && audio.type !== "audio/mpeg") {
      return NextResponse.json({ error: "Format invalide : MP3 uniquement" }, { status: 400 });
    }

    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const recentCount = await prisma.track.count({
      where: { artistId: session.artistId!, createdAt: { gte: weekAgo } },
    });
    if (recentCount >= 2) {
      return NextResponse.json(
        { error: "Limite atteinte : 2 chansons maximum sur 7 jours" },
        { status: 429 }
      );
    }

    const hash = sha256Buffer(audioBuf);
    const audioUrl = await saveUpload(
      "audio",
      `${session.artistId}_${Date.now()}.mp3`,
      audioBuf
    );

    let coverUrl =
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop";
    if (cover instanceof File && cover.size > 0) {
      if (cover.size > MAX_COVER_BYTES) {
        return NextResponse.json({ error: "Pochette trop lourde (max 5 Mo)" }, { status: 400 });
      }
      const coverBuf = Buffer.from(await cover.arrayBuffer());
      const ext = cover.name.split(".").pop()?.toLowerCase() || "jpg";
      coverUrl = await saveUpload("covers", `${session.artistId}_${Date.now()}.${ext}`, coverBuf);
    }

    if (artistName) {
      await prisma.artist.update({
        where: { id: session.artistId! },
        data: { name: artistName },
      });
    }

    const track = await prisma.track.create({
      data: {
        artistId: session.artistId!,
        title,
        genre,
        year,
        description: description || null,
        tags,
        lyrics: lyrics || null,
        coverUrl,
        audioUrl,
        fileSize: audioBuf.length,
        fileHash: hash,
        status: "PUBLISHED",
        duration: "—",
      },
    });

    return NextResponse.json({ ok: true, track });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "FORBIDDEN_ARTIST") {
      return NextResponse.json({ error: "Compte artiste requis" }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
