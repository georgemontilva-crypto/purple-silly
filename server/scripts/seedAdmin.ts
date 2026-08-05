/**
 * Creates the first admin user. Run once after deploying, against the
 * production DATABASE_URL:
 *
 *   pnpm seed:admin <email> <password> [name]
 *
 * or via env vars: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME.
 */
import "dotenv/config";
import { hashPassword } from "../_core/auth";
import { createUser, getUserByEmail } from "../db";

async function main() {
  const email = process.argv[2] ?? process.env.SEED_ADMIN_EMAIL;
  const password = process.argv[3] ?? process.env.SEED_ADMIN_PASSWORD;
  const name = process.argv[4] ?? process.env.SEED_ADMIN_NAME ?? null;

  if (!email || !password) {
    console.error("Usage: pnpm seed:admin <email> <password> [name]");
    console.error("  (or set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME)");
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    console.error(
      `A user with email ${normalizedEmail} already exists (id=${existing.id}, role=${existing.role}).`
    );
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({
    email: normalizedEmail,
    passwordHash,
    name,
    role: "admin",
  });

  console.log(`Admin user created: ${user?.email} (id=${user?.id}).`);
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
