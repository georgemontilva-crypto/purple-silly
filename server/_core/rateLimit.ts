import { TRPCError } from "@trpc/server";
import type { Request } from "express";

/**
 * In-memory, per-process rate limiting. Good enough for a single Railway
 * instance; it resets on deploy/restart and won't be shared across replicas
 * if this ever scales horizontally — swap for a shared store (e.g. Redis)
 * if that becomes a real deployment shape.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodic cleanup so `buckets` doesn't grow forever.
setInterval(
  () => {
    const now = Date.now();
    buckets.forEach((bucket, key) => {
      if (now > bucket.resetAt) buckets.delete(key);
    });
  },
  5 * 60 * 1000
).unref();

export function getClientIp(req: Request): string {
  // Requires `app.set("trust proxy", ...)` server-side for req.ip to reflect
  // the real client behind Railway's proxy instead of the proxy's own IP.
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/** Returns true if the call is allowed, false if the caller is over the limit. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Throws TOO_MANY_REQUESTS if the caller is over the limit. */
export function enforceRateLimit(key: string, limit: number, windowMs: number): void {
  if (!checkRateLimit(key, limit, windowMs)) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Please try again later." });
  }
}
