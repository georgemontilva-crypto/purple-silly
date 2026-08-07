import { TRPCError } from "@trpc/server";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * quicktime is in the list because that's what an iPhone hands over when
 * you pick a video from the camera roll on a Mac — refusing it would reject
 * the most likely source of a reel.
 */
export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

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

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!client || !bucket || !publicUrl) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "R2 not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL to your environment variables.",
    });
  }
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!client || !bucket) return; // silently skip if not configured
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/**
 * Signs a one-off PUT the browser can upload to directly.
 *
 * This exists for files too big to pass through the API. Every other
 * uploader here base64-encodes the file into a tRPC call, which is fine at
 * 5MB and hopeless for video: base64 inflates the payload by a third and
 * the whole thing is buffered in the API process' memory before it ever
 * reaches R2. With a presigned URL the bytes go browser → R2 and the server
 * only hands out a signature.
 *
 * The URL is scoped to one key AND one content type, and expires — it is
 * not a general write token for the bucket. The caller must send the same
 * Content-Type header it asked for, or R2 rejects the signature.
 *
 * NOTE: the bucket needs a CORS rule allowing PUT from the site's origin,
 * otherwise the browser blocks the request before it's even sent. That's
 * bucket configuration, not something this code can set.
 */
export async function createPresignedUpload(
  key: string,
  contentType: string,
  expiresInSeconds = 600
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!client || !bucket || !publicUrl) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "R2 not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL to your environment variables.",
    });
  }
  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: expiresInSeconds }
  );
  return { uploadUrl, publicUrl: `${publicUrl.replace(/\/$/, "")}/${key}` };
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
