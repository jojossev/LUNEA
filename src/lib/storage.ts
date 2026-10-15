import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/** Taille max MP3 : 20 Mo (CDC) */
export const MAX_MP3_BYTES = 20 * 1024 * 1024;
export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const LISTEN_VALIDATE_SECONDS = 60;
export const LISTEN_COOLDOWN_MS = 12 * 60 * 60 * 1000;
export const DOWNLOAD_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export function hashIp(ip: string) {
  return createHash("sha256")
    .update(ip + (process.env.AUTH_SECRET || "lunea"))
    .digest("hex")
    .slice(0, 32);
}

export function sha256Buffer(buf: Buffer) {
  return createHash("sha256").update(buf).digest("hex");
}

export function isMp3Buffer(buf: Buffer) {
  if (buf.length < 3) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true;
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return true;
  return false;
}

export function clientIpFromHeaders(headers: Headers) {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}

function s3Enabled() {
  return Boolean(process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY);
}

function getS3() {
  return new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });
}

async function ensureBucket(client: S3Client, bucket: string) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    try {
      await client.send(new CreateBucketCommand({ Bucket: bucket }));
    } catch {
      /* bucket may already exist */
    }
  }
}

/**
 * Stockage : local `public/uploads` par défaut.
 * Optionnel : S3 cloud (AWS / R2) via variables S3_* dans .env
 */
export async function saveUpload(subdir: "audio" | "covers", filename: string, data: Buffer) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${subdir}/${safe}`;
  const contentType = subdir === "audio" ? "audio/mpeg" : "image/jpeg";

  if (s3Enabled()) {
    const bucket = process.env.S3_BUCKET || "lunea-media";
    const client = getS3();
    await ensureBucket(client, bucket);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
    );
    const publicBase = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
    // If publicBase already includes bucket name, don't add it again
    if (publicBase!.includes(bucket)) {
      return `${publicBase!.replace(/\/$/, "")}/${key}`;
    }
    return `${publicBase!.replace(/\/$/, "")}/${bucket}/${key}`;
  }

  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safe), data);
  return `/uploads/${subdir}/${safe}`;
}
