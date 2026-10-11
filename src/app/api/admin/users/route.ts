import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/session";

export async function PATCH(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const { userId, status } = body as { userId?: string; status?: "Actif" | "Suspendu" };

    if (!userId || !status) {
      return NextResponse.json({ error: "userId et status requis" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    if (e instanceof Error && (e.message === "UNAUTHORIZED" || e.message === "FORBIDDEN_ADMIN")) {
      return NextResponse.json({ error: "Admin requis" }, { status: 403 });
    }
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
