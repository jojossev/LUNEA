/**
 * Intégration Flex Pay.
 * Sans clés API : mode simulation (enregistre le paiement en DB).
 * Avec FLEXPAY_API_URL + FLEXPAY_API_KEY : appelle l'API réelle.
 */

export type FlexPayChargeResult = {
  ok: boolean;
  mode: "live" | "simulation";
  reference: string;
  message: string;
};

export type FlexPayPayoutResult = {
  ok: boolean;
  mode: "live" | "simulation";
  reference: string;
  message: string;
};

function configured() {
  return Boolean(process.env.FLEXPAY_API_URL && process.env.FLEXPAY_API_KEY);
}

export async function chargePremiumFlexPay(params: {
  account: string;
  amountUsd: number;
  artistId: string;
}): Promise<FlexPayChargeResult> {
  const reference = `prem_${params.artistId}_${Date.now()}`;

  if (!configured()) {
    return {
      ok: true,
      mode: "simulation",
      reference,
      message: "Paiement Flex Pay simulé (configurez FLEXPAY_API_URL / FLEXPAY_API_KEY pour le live).",
    };
  }

  try {
    const res = await fetch(`${process.env.FLEXPAY_API_URL}/v1/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLEXPAY_API_KEY}`,
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
      return { ok: false, mode: "live", reference, message: text || "Échec Flex Pay" };
    }
    return { ok: true, mode: "live", reference, message: "Paiement Flex Pay confirmé" };
  } catch (e) {
    return {
      ok: false,
      mode: "live",
      reference,
      message: e instanceof Error ? e.message : "Erreur réseau Flex Pay",
    };
  }
}

export async function payoutArtistFlexPay(params: {
  account: string;
  amountUsd: number;
  withdrawalId: string;
}): Promise<FlexPayPayoutResult> {
  const reference = `wd_${params.withdrawalId}`;

  if (!configured()) {
    return {
      ok: true,
      mode: "simulation",
      reference,
      message: "Retrait Flex Pay en attente de traitement manuel (mode simulation).",
    };
  }

  try {
    const res = await fetch(`${process.env.FLEXPAY_API_URL}/v1/payouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLEXPAY_API_KEY}`,
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
      return { ok: false, mode: "live", reference, message: text || "Échec payout Flex Pay" };
    }
    return { ok: true, mode: "live", reference, message: "Payout Flex Pay initié" };
  } catch (e) {
    return {
      ok: false,
      mode: "live",
      reference,
      message: e instanceof Error ? e.message : "Erreur réseau Flex Pay",
    };
  }
}
