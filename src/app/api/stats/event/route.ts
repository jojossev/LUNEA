import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPremiumActive, RATE_DOWNLOAD, RATE_LISTEN } from "@/lib/data";
import { appendLedger } from "@/lib/ledger";
import { getSession } from "@/lib/session";
import {
  DOWNLOAD_COOLDOWN_MS,
  LISTEN_COOLDOWN_MS,
  LISTEN_VALIDATE_SECONDS,
  clientIpFromHeaders,
  hashIp,
} from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { trackId, type, listenedSeconds, clientKey } = body as {
      trackId?: string;
      type?: "listen" | "download";
      listenedSeconds?: number;
      clientKey?: string;
    };

    if (!trackId || !type) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { artist: true },
    });
    if (!track || track.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Chanson introuvable" }, { status: 404 });
    }

    const session = await getSession();
    const ip = clientIpFromHeaders(req.headers);
    const ipHash = hashIp(ip);
    const key = clientKey || ipHash;
    const premium = isPremiumActive(track.artist);

    if (type === "listen") {
      const seconds = Number(listenedSeconds) || 0;
      if (seconds < LISTEN_VALIDATE_SECONDS) {
        return NextResponse.json(
          {
            error: `Écoute non validée (minimum ${LISTEN_VALIDATE_SECONDS}s)`,
            required: LISTEN_VALIDATE_SECONDS,
          },
          { status: 400 }
        );
      }

      const since = new Date(Date.now() - LISTEN_COOLDOWN_MS);
      const duplicate = await prisma.listen.findFirst({
        where: {
          trackId: track.id,
          createdAt: { gte: since },
          OR: [
            ...(session?.userId ? [{ listenerId: session.userId }] : []),
            { clientKey: key },
            { ipHash },
          ],
        },
      });
      if (duplicate) {
        return NextResponse.json({
          ok: true,
          counted: false,
          reason: "anti-fraude: déjà comptée récemment",
        });
      }

      const amount = RATE_LISTEN;
      await prisma.listen.create({
        data: {
          trackId: track.id,
          artistId: track.artistId,
          listenerId: session?.userId ?? null,
          clientKey: key,
          ipHash,
          listenedSeconds: seconds,
          validated: true,
          monetized: premium,
          amount: premium ? amount : 0,
        },
      });
      await prisma.track.update({
        where: { id: track.id },
        data: { plays: { increment: 1 } },
      });

      if (premium) {
        await prisma.artist.update({
          where: { id: track.artistId },
          data: { realBalance: { increment: amount } },
        });
        await appendLedger({
          artistId: track.artistId,
          kind: "REAL_LISTEN",
          amount,
          note: `Écoute monétisée — ${track.title}`,
        });
      } else if (track.artist.premiumStatus === "NORMAL") {
        await prisma.artist.update({
          where: { id: track.artistId },
          data: { virtualRevenue: { increment: amount } },
        });
        await appendLedger({
          artistId: track.artistId,
          kind: "VIRTUAL_LISTEN",
          amount,
          note: `Écoute virtuelle — ${track.title}`,
        });
      }

      return NextResponse.json({ ok: true, counted: true, monetized: premium, amount: premium ? amount : 0 });
    }

    const since = new Date(Date.now() - DOWNLOAD_COOLDOWN_MS);
    const duplicate = await prisma.download.findFirst({
      where: {
        trackId: track.id,
        createdAt: { gte: since },
        OR: [
          ...(session?.userId ? [{ downloaderId: session.userId }] : []),
          { clientKey: key },
          { ipHash },
        ],
      },
    });
    if (duplicate) {
      return NextResponse.json({
        ok: true,
        counted: false,
        reason: "anti-fraude: téléchargement déjà compté",
        audioUrl: track.audioUrl,
      });
    }

    const amount = RATE_DOWNLOAD;
    await prisma.download.create({
      data: {
        trackId: track.id,
        artistId: track.artistId,
        downloaderId: session?.userId ?? null,
        clientKey: key,
        ipHash,
        monetized: premium,
        amount: premium ? amount : 0,
      },
    });
    await prisma.track.update({
      where: { id: track.id },
      data: { downloads: { increment: 1 } },
    });

    if (premium) {
      await prisma.artist.update({
        where: { id: track.artistId },
        data: { realBalance: { increment: amount } },
      });
      await appendLedger({
        artistId: track.artistId,
        kind: "REAL_DOWNLOAD",
        amount,
        note: `Téléchargement monétisé — ${track.title}`,
      });
    } else if (track.artist.premiumStatus === "NORMAL") {
      await prisma.artist.update({
        where: { id: track.artistId },
        data: { virtualRevenue: { increment: amount } },
      });
      await appendLedger({
        artistId: track.artistId,
        kind: "VIRTUAL_DOWNLOAD",
        amount,
        note: `Téléchargement virtuel — ${track.title}`,
      });
    }

    return NextResponse.json({
      ok: true,
      counted: true,
      monetized: premium,
      amount: premium ? amount : 0,
      audioUrl: track.audioUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
