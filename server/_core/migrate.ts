import path from "node:path";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

/**
 * Applies any pending migrations, before the server accepts traffic.
 *
 * This is the piece that was missing since the initial audit: nothing ever
 * ran `drizzle-kit migrate` against production, so every schema change had
 * to be applied to the database by hand. That is how the deployed database
 * ended up with tables that `__drizzle_migrations` had no record of.
 *
 * Where the folder comes from: the Dockerfile does `COPY . .` and never
 * prunes, so `drizzle/` — the .sql files AND meta/_journal.json, both of
 * which the migrator needs — ships inside the image. The path is resolved
 * from cwd rather than from this module because the server is bundled into
 * dist/ by esbuild, so __dirname at runtime is not where the source lives.
 */
const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "drizzle");

export async function runMigrations(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    // Local tooling and the tests run without a database on purpose; the
    // app already degrades to "no DB" everywhere else (see server/db.ts).
    console.log("[migrate] DATABASE_URL not set — skipping migrations.");
    return;
  }

  // A dedicated single connection rather than the app's pool: this runs
  // once at boot, and closing it afterwards means a long migration can't
  // leave a connection parked in the pool the request path then inherits.
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("[migrate] Applying pending migrations…");
    await migrate(drizzle(connection), { migrationsFolder: MIGRATIONS_FOLDER });
    console.log("[migrate] Database is up to date.");
  } catch (error) {
    console.error("[migrate] Migration failed:", error);

    /*
     * Production stops here on purpose.
     *
     * A failed migration means the schema is not what the code expects, and
     * serving anyway just turns one clear boot error into a stream of
     * confusing 500s from whichever routers touch the missing column. On
     * Railway a container that exits during boot fails the deploy and the
     * PREVIOUS release keeps serving — which is the outcome you want.
     *
     * Development keeps going: a broken migration there should not stop
     * someone working on the frontend against a half-set-up database.
     */
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  } finally {
    await connection.end().catch(() => {
      /* already closed or never opened — nothing to clean up */
    });
  }
}
