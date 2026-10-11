import { createHash } from "crypto";
import { prisma } from "./db";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Journal financier append-only avec chaîne de hash (CDC).
 */
export async function appendLedger(
  params: {
    artistId: string;
    kind: string;
    amount: number;
    note?: string;
  },
  db: typeof prisma | Tx = prisma
) {
  const last = await db.ledgerEntry.findFirst({
    where: { artistId: params.artistId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { entryHash: true },
  });

  const prevHash = last?.entryHash ?? "GENESIS";
  const createdAt = new Date();
  const payload = [
    prevHash,
    params.artistId,
    params.kind,
    Number(params.amount).toFixed(4),
    params.note ?? "",
    createdAt.toISOString(),
  ].join("|");
  const entryHash = createHash("sha256").update(payload).digest("hex");

  return db.ledgerEntry.create({
    data: {
      artistId: params.artistId,
      kind: params.kind,
      amount: params.amount,
      note: params.note,
      prevHash,
      entryHash,
      createdAt,
    },
  });
}
