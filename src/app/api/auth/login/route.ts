import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { buildSessionForUser, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, password } = body as { login?: string; password?: string };

    if (!login || !password) {
      return NextResponse.json({ error: "Identifiants requis" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: login }, { username: login }] },
      include: { artist: true },
    });

    if (!user || user.status !== "Actif" || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const session = await buildSessionForUser(user.id);
    if (!session) {
      return NextResponse.json({ error: "Compte indisponible" }, { status: 403 });
    }
    await setSessionCookie(session);

    return NextResponse.json({
      ok: true,
      user: session,
      redirect:
        session.role === "ADMIN"
          ? "/admin"
          : session.role === "ARTIST"
            ? session.premiumStatus === "PREMIUM_ACTIVE"
              ? "/dashboard/premium"
              : "/dashboard"
            : "/",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
