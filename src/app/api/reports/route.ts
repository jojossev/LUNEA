import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, requireAdminSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { trackId, reason } = body as { trackId?: string; reason?: string };

    if (!trackId || !reason?.trim()) {
      return NextResponse.json({ error: "Chanson et motif requis" }, { status: 400 });
    }

    const track = await prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      return NextResponse.json({ error: "Chanson introuvable" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        trackId,
        reason: reason.trim(),
        reporterId: session?.userId ?? null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, report });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const { reportId, status, action } = body as {
      reportId?: string;
      status?: string;
      action?: "hide" | "delete" | "resolve";
    };

    if (!reportId) {
      return NextResponse.json({ error: "reportId requis" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Signalement introuvable" }, { status: 404 });
    }

    if (action === "hide") {
      await prisma.track.update({
        where: { id: report.trackId },
        data: { status: "HIDDEN" },
      });
    }
    if (action === "delete") {
      await prisma.track.update({
        where: { id: report.trackId },
        data: { status: "SUSPENDED" },
      });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status: status || (action ? "RESOLVED" : "PROCESSING") },
    });

    return NextResponse.json({ ok: true, report: updated });
  } catch (e) {
    if (e instanceof Error && (e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN_ADMIN")) {
      return NextResponse.json({ error: "Admin requis" }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
