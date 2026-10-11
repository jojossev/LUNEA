import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

export type SessionPayload = {
  userId: string;
  username: string;
  email: string;
  role: string;
  artistId: string | null;
  premiumStatus: string | null;
};

const COOKIE = "lunea_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 jours

function secretKey() {
  const secret = process.env.AUTH_SECRET || "lunea-dev-secret-change-me-in-production-32b";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      userId: String(payload.userId),
      username: String(payload.username),
      email: String(payload.email),
      role: String(payload.role),
      artistId: payload.artistId ? String(payload.artistId) : null,
      premiumStatus: payload.premiumStatus ? String(payload.premiumStatus) : null,
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireArtistSession() {
  const session = await requireSession();
  if (session.role !== "ARTIST" || !session.artistId) throw new Error("FORBIDDEN_ARTIST");
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN_ADMIN");
  return session;
}

export async function buildSessionForUser(userId: string): Promise<SessionPayload | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { artist: true },
  });
  if (!user || user.status !== "Actif") return null;
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    artistId: user.artist?.id ?? null,
    premiumStatus: user.artist?.premiumStatus ?? null,
  };
}

export { COOKIE as SESSION_COOKIE };
