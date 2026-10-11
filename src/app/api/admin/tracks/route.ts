import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/session";

export async function PATCH(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const { trackId, status } = body as {
      trackId?: string;
      status?: "PUBLISHED" | "HIDDEN" | "SUSPENDED" | "DRAFT";
    };

    if (!trackId || !status) {
      return NextResponse.json({ error: "trackId et status requis" }, { status: 400 });
    }

    const track = await prisma.track.update({
      where: { id: trackId },
      data: { status },
    });

    return NextResponse.json({ ok: true, track });
  } catch (e) {
    if (e instanceof Error && (e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN_ADMIN")) {
      return NextResponse.json({ error: "Admin requis" }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
