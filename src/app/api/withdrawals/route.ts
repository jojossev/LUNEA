import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPremiumActive } from "@/lib/data";
import { appendLedger } from "@/lib/ledger";
import { payoutArtistNewcoin } from "@/lib/newcoin";
import { payoutArtistFlexPay } from "@/lib/flexpay";
import { requireArtistSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await requireArtistSession();
    const body = await req.json();
    const { amount, paymentMethod, newcoinAccount, flexpayAccount } = body as {
      amount?: number;
      paymentMethod?: "newcoin" | "flexpay";
      newcoinAccount?: string;
      flexpayAccount?: string;
    };

    if (!paymentMethod || (paymentMethod !== "newcoin" && paymentMethod !== "flexpay")) {
      return NextResponse.json({ error: "Méthode de paiement invalide" }, { status: 400 });
    }

    const account = paymentMethod === "newcoin" ? newcoinAccount : flexpayAccount;
    if (!amount || !account?.trim()) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (amount < 500) {
      return NextResponse.json({ error: "Retrait minimum : 500 $" }, { status: 400 });
    }

    const artist = await prisma.artist.findUnique({ where: { id: session.artistId! } });
    if (!artist) {
      return NextResponse.json({ error: "Artiste introuvable" }, { status: 404 });
    }
    if (!isPremiumActive(artist)) {
      return NextResponse.json({ error: "Retrait réservé aux artistes Premium" }, { status: 403 });
    }
    if (artist.realBalance < amount) {
      return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
    }

    const withdrawal = await prisma.$transaction(async (tx) => {
      const w = await tx.withdrawal.create({
        data: {
          artistId: artist.id,
          amount,
          method: paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay",
          ...(paymentMethod === "newcoin"
            ? { newcoinAccount: account.trim() }
            : { flexpayAccount: account.trim() }),
          status: "PENDING",
        },
      });
      await tx.artist.update({
        where: { id: artist.id },
        data: { realBalance: { decrement: amount } },
      });
      await appendLedger(
        {
          artistId: artist.id,
          kind: "WITHDRAWAL",
          amount: -amount,
          note: `Demande retrait ${paymentMethod === "newcoin" ? "Newcoin" : "Flex Pay"} ${account.trim()} (#${w.id})`,
        },
        tx
      );
      return w;
    });

    const payout =
      paymentMethod === "newcoin"
        ? await payoutArtistNewcoin({
            account: account.trim(),
            amountUsd: amount,
            withdrawalId: withdrawal.id,
          })
        : await payoutArtistFlexPay({
            account: account.trim(),
            amountUsd: amount,
            withdrawalId: withdrawal.id,
          });

    if (payout.ok && payout.mode === "live") {
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "PROCESSING" },
      });
    }

    return NextResponse.json({ ok: true, withdrawal, payout });
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
