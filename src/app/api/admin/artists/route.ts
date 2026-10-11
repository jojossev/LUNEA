import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/session";

export async function PATCH(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const { artistId, verified, suspendUser } = body as {
      artistId?: string;
      verified?: boolean;
      suspendUser?: boolean;
    };

    if (!artistId) {
      return NextResponse.json({ error: "artistId requis" }, { status: 400 });
    }

    const artist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!artist) {
      return NextResponse.json({ error: "Artiste introuvable" }, { status: 404 });
    }

    const updated = await prisma.artist.update({
      where: { id: artistId },
      data: {
        ...(typeof verified === "boolean" ? { verified } : {}),
      },
    });

    if (typeof suspendUser === "boolean") {
      await prisma.user.update({
        where: { id: artist.userId },
        data: { status: suspendUser ? "Suspendu" : "Actif" },
      });
    }

    return NextResponse.json({ ok: true, artist: updated });
  } catch (e) {
    if (e instanceof Error && (e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN_ADMIN")) {
      return NextResponse.json({ error: "Admin requis" }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
