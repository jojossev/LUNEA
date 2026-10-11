/**
 * Intégration Newcoin (CDC).
 * Sans clés API : mode simulation (enregistre le paiement en DB).
 * Avec NEWCOIN_API_URL + NEWCOIN_API_KEY : appelle l'API réelle.
 */

export type NewcoinChargeResult = {
  ok: boolean;
  mode: "live" | "simulation";
  reference: string;
  message: string;
};

export type NewcoinPayoutResult = {
  ok: boolean;
  mode: "live" | "simulation";
  reference: string;
  message: string;
};

function configured() {
  return Boolean(process.env.NEWCOIN_API_URL && process.env.NEWCOIN_API_KEY);
}

export async function chargePremiumNewcoin(params: {
  account: string;
  amountUsd: number;
  artistId: string;
}): Promise<NewcoinChargeResult> {
  const reference = `prem_${params.artistId}_${Date.now()}`;

  if (!configured()) {
    return {
      ok: true,
      mode: "simulation",
      reference,
      message: "Paiement Newcoin simulé (configurez NEWCOIN_API_URL / NEWCOIN_API_KEY pour le live).",
    };
  }

  try {
    const res = await fetch(`${process.env.NEWCOIN_API_URL}/v1/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEWCOIN_API_KEY}`,
      },
      body: JSON.stringify({
        account: params.account,
        amount: params.amountUsd,
        currency: "USD",
        reference,
        memo: "LUNEA Premium 31 days",
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, mode: "live", reference, message: text || "Échec Newcoin" };
    }
    return { ok: true, mode: "live", reference, message: "Paiement Newcoin confirmé" };
  } catch (e) {
    return {
      ok: false,
      mode: "live",
      reference,
      message: e instanceof Error ? e.message : "Erreur réseau Newcoin",
    };
  }
}

export async function payoutArtistNewcoin(params: {
  account: string;
  amountUsd: number;
  withdrawalId: string;
}): Promise<NewcoinPayoutResult> {
  const reference = `wd_${params.withdrawalId}`;

  if (!configured()) {
    return {
      ok: true,
      mode: "simulation",
      reference,
      message: "Retrait Newcoin en attente de traitement manuel (mode simulation).",
    };
  }

  try {
    const res = await fetch(`${process.env.NEWCOIN_API_URL}/v1/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEWCOIN_API_KEY}`,
      },
      body: JSON.stringify({
        account: params.account,
        amount: params.amountUsd,
        currency: "USD",
        reference,
        memo: "LUNEA artist withdrawal",
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, mode: "live", reference, message: text || "Échec payout Newcoin" };
    }
    return { ok: true, mode: "live", reference, message: "Payout Newcoin initié" };
  } catch (e) {
    return {
      ok: false,
      mode: "live",
      reference,
      message: e instanceof Error ? e.message : "Erreur réseau Newcoin",
    };
  }
}
