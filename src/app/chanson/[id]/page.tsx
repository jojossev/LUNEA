import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrackById } from "@/lib/data";
import ChansonClientPage from "./_client";
import type { TrackWithArtist } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ChansonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const track = await getTrackById(id);
  if (!track) notFound();

  return <ChansonClientPage track={track as TrackWithArtist} />;
}
