# CLAUDE.md — purple-silly (Purple Organics / "Silly")

Repo: `georgemontilva-crypto/purple-silly` · Deploy: Railway · Storage: Cloudflare R2

Guidance for anyone — human or Claude Code — working in this repo.

---

## Database migrations — the only allowed flow

**Never create or alter a database object by hand.** Not in the Railway MySQL
console, not with a one-off script, not "just this once because it's small".

That rule exists because of what happened without it: nothing ran migrations
against production, so schema changes were applied manually, and the database
ended up with tables that `__drizzle_migrations` had no record of. The next
`migrate` run then tried to create objects that already existed. Recovering
from that meant hand-writing rows into `__drizzle_migrations` with hashes
computed from the migration files — an hour of careful work to undo a minute
of convenience.

### The flow

1. **Edit `drizzle/schema.ts`.** The schema file is the source of truth.
2. **Generate the migration:**
   ```bash
   pnpm exec drizzle-kit generate
   ```
   This writes `drizzle/NNNN_name.sql` and updates `drizzle/meta/`.
   It needs `DATABASE_URL` set to _something_ to load the config, but it does
   not connect — any placeholder URL works for generating.
3. **Read the generated SQL before committing it.** Generators do produce
   destructive statements; a `DROP COLUMN` reaches production the same way a
   `CREATE TABLE` does.
4. **Commit `drizzle/NNNN_name.sql` AND `drizzle/meta/`** together, in the same
   commit as the schema change. The journal and the .sql file are one unit.
5. **Deploy.** The server applies pending migrations at boot — see
   `server/_core/migrate.ts`, called from `startServer()` before it listens.

Nothing else is required. There is no manual step in production.

### Seed data

Put it in the migration, guarded so a re-run can't duplicate it:

```sql
INSERT INTO `t` (...)
SELECT * FROM ( SELECT ... ) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `t`);
```

Migrations get re-run against databases that are already live. An unguarded
`INSERT` either duplicates the seed or resurrects rows someone deleted on
purpose. See `drizzle/0011_daily_queen_noir.sql`.

### How the migrator decides what to run

Worth knowing before touching `__drizzle_migrations` in an emergency:

- The table is `__drizzle_migrations (id serial, hash text, created_at bigint)`.
- `hash` is `sha256` of the **entire .sql file contents**, as bytes on disk.
- `created_at` is the `when` value for that migration in
  `drizzle/meta/_journal.json` — not the wall-clock time it was applied.
- Drizzle reads **only the single row with the highest `created_at`** and runs
  every migration whose journal `when` is greater than it. It does not compare
  hashes, and it does not check individual rows.

That last point is the useful one: marking a migration as already-applied means
inserting a row whose `created_at` is its journal `when`.

**Line endings matter for the hash.** This repo has no `.gitattributes`, so a
Windows checkout with `core.autocrlf=true` has CRLF files while the Linux
container has LF — different bytes, different hash. Compute hashes from the
committed blob (`git cat-file -p HEAD:drizzle/X.sql | sha256sum`), never from a
Windows working copy.

### If the database and the journal disagree

Don't guess and don't re-run DDL that already succeeded. Register the migration
as applied instead:

```sql
INSERT INTO `__drizzle_migrations` (`hash`, `created_at`)
VALUES ('<sha256 of the .sql file>', <journal "when">);
```

Then let the next deploy apply whatever genuinely remains.

---

## Storage (Cloudflare R2)

Two upload paths, and the choice between them is about size:

- **Images** (site assets, popup images, review photos) go through tRPC as
  base64. Capped at 5MB — `assertImageSize` in `server/_core/r2.ts`.
- **Video** (home reels) uses a presigned PUT so the bytes go browser → R2 and
  never through the API process. base64 inflates a payload by a third and
  buffers the whole file in memory; that is fine at 5MB and not at 100MB.
  Presigned uploads need a **CORS rule on the bucket** allowing PUT from the
  site's origin — that is bucket configuration, not something the code can set.

When deleting a record that owns an object, **delete from R2 first, then the
row.** A failed object delete then leaves a row still pointing at the file
rather than stranding it in the bucket with nothing referencing it.

Never build an object key from a caller's filename. Take the extension only,
and only after it passes a strict pattern — see `reelKey` in
`server/routers/homeReels.ts` and its tests.

---

## Conventions

- `pnpm check` (tsc) and `pnpm test` (vitest) must both pass before a commit.
- `pnpm format` runs Prettier; match the surrounding file rather than
  reformatting code you didn't touch.
- Storefront copy is **English**. The `/admin` UI is **Spanish**.
- The storefront palette is purple/magenta in `oklch`; `/admin` has its own
  higher-contrast black/purple palette in `client/src/lib/adminTheme.ts`.
- Bounds live in one place: a zod object exported from the router
  (`popupFields`, `reviewFields`) is what the admin form mirrors, so the form
  and the column widths can't drift.

### Layering (learned the hard way)

Background decoration must never paint over content. Don't rely on giving
every content wrapper a `z-index`: make the section a stacking context with
`isolation: isolate` and put the decorative layer at `z-index: -1` inside it.
A negative-z child paints above its context's background and below all of its
in-flow content. See `client/src/components/motion/AmbientGlow.css`.

---

## Environment

Required in Railway: `DATABASE_URL`, `JWT_SECRET`, `R2_ACCOUNT_ID`,
`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.

Locally the app runs **without** a database on purpose: `getDb()` returns null,
routers degrade, and the boot-time migration logs a skip instead of failing.
That is what makes it possible to run the dev server and check the UI without
production credentials.
