import { TRPCError } from "@trpc/server";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!client || !bucket || !publicUrl) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "R2 not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL to your environment variables.",
    });
  }
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!client || !bucket) return; // silently skip if not configured
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Throws if the buffer is over the shared per-image size limit. */
export function assertImageSize(buffer: Buffer): void {
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Image is too large. Max ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`,
    });
  }
}
