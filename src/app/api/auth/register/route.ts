import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { buildSessionForUser, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, phone, role } = body as {
      username?: string;
      email?: string;
      password?: string;
      phone?: string;
      role?: "user" | "artist";
    };

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Mot de passe trop court (min. 6)" }, { status: 400 });
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) {
      return NextResponse.json({ error: "E-mail ou pseudo déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const isArtist = role === "artist";
    const slugBase = username.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "artiste";

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        phone: phone || null,
        role: isArtist ? "ARTIST" : "LISTENER",
        artist: isArtist
          ? {
              create: {
                name: username,
                slug: `${slugBase}-${Date.now().toString(36)}`,
                bio: "",
                genre: "Afrobeat",
                city: "",
                country: "",
                imageUrl:
                  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
              },
            }
          : undefined,
      },
    });

    const session = await buildSessionForUser(user.id);
    if (session) await setSessionCookie(session);

    return NextResponse.json({
      ok: true,
      user: session,
      redirect: isArtist ? "/dashboard" : "/",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
