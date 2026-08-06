import crypto from "crypto";
import { eq } from "drizzle-orm";
import { emailVerificationTokens, users } from "../../drizzle/schema";
import { requireDb } from "../db";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerificationToken(userId: number): Promise<string> {
  const d = await requireDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  await d.insert(emailVerificationTokens).values({ userId, token, expiresAt });
  return token;
}

export async function consumeEmailVerificationToken(
  token: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const d = await requireDb();
  const [row] = await d
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .limit(1);

  if (!row) return { ok: false, error: "Invalid verification link." };
  if (row.usedAt) return { ok: false, error: "This link has already been used." };
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, error: "This link has expired." };

  await d
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(emailVerificationTokens.id, row.id));
  await d.update(users).set({ emailVerified: true }).where(eq(users.id, row.userId));

  return { ok: true };
}
