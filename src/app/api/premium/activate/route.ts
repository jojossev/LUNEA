import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appendLedger } from "@/lib/ledger";
import { chargePremiumNewcoin } from "@/lib/newcoin";
import { chargePremiumFlexPay } from "@/lib/flexpay";
import { buildSessionForUser, requireArtistSession, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await requireArtistSession();
    const body = await req.json();
    const { paymentMethod, newcoinAccount, flexpayAccount } = body as {
      paymentMethod?: "newcoin" | "flexpay";
      newcoinAccount?: string;
      flexpayAccount?: string;
    };

    if (!paymentMethod || (paymentMethod !== "newcoin" && paymentMethod !== "flexpay")) {
      return NextResponse.json({ error: "Méthode de paiement invalide" }, { status: 400 });
    }

    const account = paymentMethod === "newcoin" ? newcoinAccount : flexpayAccount;
    if (!account?.trim()) {
      return NextResponse.json(
        { error: `Compte ${paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay"} requis` },
        { status: 400 }
      );
    }

    const charge =
      paymentMethod === "newcoin"
        ? await chargePremiumNewcoin({
            account: account.trim(),
            amountUsd: 12,
            artistId: session.artistId!,
          })
        : await chargePremiumFlexPay({
            account: account.trim(),
            amountUsd: 12,
            artistId: session.artistId!,
          });

    if (!charge.ok) {
      return NextResponse.json({ error: charge.message }, { status: 402 });
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 31 * 86400000);

    await prisma.$transaction([
      prisma.artist.update({
        where: { id: session.artistId! },
        data: {
          premiumStatus: "PREMIUM_ACTIVE",
          premiumActivatedAt: now,
          premiumExpiresAt: expires,
          ...(paymentMethod === "newcoin"
            ? { newcoinAccount: account.trim() }
            : { flexpayAccount: account.trim() }),
        },
      }),
      prisma.premiumPayment.create({
        data: {
          artistId: session.artistId!,
          amount: 12,
          method: paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay",
          ...(paymentMethod === "newcoin"
            ? { newcoinAccount: account.trim() }
            : { flexpayAccount: account.trim() }),
          createdAt: now,
          expiresAt: expires,
        },
      }),
    ]);

    await appendLedger({
      artistId: session.artistId!,
      kind: "PREMIUM_PAYMENT",
      amount: -12,
      note: `Premium ${paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay"} (${charge.mode}) ref=${charge.reference}`,
    });

    const refreshed = await buildSessionForUser(session.userId);
    if (refreshed) await setSessionCookie(refreshed);

    return NextResponse.json({
      ok: true,
      expiresAt: expires,
      payment: charge,
    });
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
