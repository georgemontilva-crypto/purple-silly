import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { homeReels } from "../../drizzle/schema";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb, requireDb } from "../db";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  createPresignedUpload,
  deleteFromR2,
} from "../_core/r2";

/**
 * How many active reels the storefront shows. The row is built for exactly
 * four across on desktop; a fifth would either shrink them all or wrap to a
 * lonely second row. Enforced when reading rather than when writing, so an
 * admin can keep a spare reel around inactive without losing it.
 */
export const MAX_VISIBLE_REELS = 4;

/**
 * Object key for an upload. Exported for the tests.
 *
 * The caller's filename is never used as part of the key — only its
 * extension, and only after being checked against a strict pattern. A
 * filename is attacker-controlled input, and pasting it into an object key
 * is how you end up with `../` or a query string in the path. The random
 * suffix means re-uploading the same file twice can't collide either.
 */
export function reelKey(kind: "video" | "poster", fileName: string): string {
  const ext = fileName.includes(".")
    ? fileName.split(".").pop()!.toLowerCase()
    : "bin";
  const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : "bin";
  return `home-reels/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
}

export const homeReelsRouter = router({
  /**
   * What the home page renders. Inactive reels are filtered out here, not
   * in the client, so an unpublished reel's URL never reaches the page.
   */
  listPublic: publicProcedure.query(async () => {
    const d = await getDb();
    if (!d) return [];
    const rows = await d
      .select({
        id: homeReels.id,
        title: homeReels.title,
        videoUrl: homeReels.videoUrl,
        posterUrl: homeReels.posterUrl,
      })
      .from(homeReels)
      .where(eq(homeReels.active, true))
      .orderBy(asc(homeReels.position), asc(homeReels.id))
      .limit(MAX_VISIBLE_REELS);
    return rows;
  }),

  list: adminProcedure.query(async () => {
    const d = await requireDb();
    return d
      .select()
      .from(homeReels)
      .orderBy(asc(homeReels.position), asc(homeReels.id));
  }),

  /**
   * Hands the browser a short-lived URL to PUT one file to, plus the public
   * URL that file will have once uploaded. Nothing is written to the
   * database here — the row is created by `create` once the upload lands,
   * so a failed or abandoned upload leaves no dangling record.
   */
  createUploadUrl: adminProcedure
    .input(
      z.object({
        kind: z.enum(["video", "poster"]),
        fileName: z.string().min(1).max(255),
        contentType: z.string().min(1).max(128),
      })
    )
    .mutation(async ({ input }) => {
      const allowed: readonly string[] =
        input.kind === "video"
          ? ALLOWED_VIDEO_MIME_TYPES
          : ALLOWED_IMAGE_MIME_TYPES;
      if (!allowed.includes(input.contentType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Unsupported file type. Allowed: ${allowed.join(", ")}`,
        });
      }

      const key = reelKey(input.kind, input.fileName);
      const { uploadUrl, publicUrl } = await createPresignedUpload(
        key,
        input.contentType
      );
      return { key, uploadUrl, publicUrl };
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().max(128).optional(),
        videoKey: z.string().min(1).max(512),
        videoUrl: z.string().url().max(1024),
        posterKey: z.string().max(512).optional(),
        posterUrl: z.string().url().max(1024).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const d = await requireDb();
      // Appended to the end. Reordering is a separate, explicit action.
      const existing = await d
        .select({ position: homeReels.position })
        .from(homeReels);
      const nextPosition =
        existing.reduce((max, r) => Math.max(max, r.position), -1) + 1;

      await d.insert(homeReels).values({
        title: input.title?.trim() || null,
        videoKey: input.videoKey,
        videoUrl: input.videoUrl,
        posterKey: input.posterKey || null,
        posterUrl: input.posterUrl || null,
        position: nextPosition,
        active: true,
      });
      return { success: true } as const;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().max(128).optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const { id, ...rest } = input;
      const data: Record<string, unknown> = {};
      if (rest.title !== undefined) data.title = rest.title.trim() || null;
      if (rest.active !== undefined) data.active = rest.active;
      if (Object.keys(data).length === 0) return { success: true } as const;

      await d.update(homeReels).set(data).where(eq(homeReels.id, id));
      return { success: true } as const;
    }),

  /**
   * Takes the full ordered list of ids and rewrites every position from it.
   * Sending the whole order rather than "move id X up" keeps the result the
   * same no matter how many moves the admin made before saving, and avoids
   * two rows ending up on the same position.
   */
  reorder: adminProcedure
    .input(z.object({ ids: z.array(z.number().int()).max(100) }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      for (let index = 0; index < input.ids.length; index++) {
        await d
          .update(homeReels)
          .set({ position: index })
          .where(eq(homeReels.id, input.ids[index]));
      }
      return { success: true } as const;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [row] = await d
        .select()
        .from(homeReels)
        .where(eq(homeReels.id, input.id))
        .limit(1);
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reel not found" });
      }

      // R2 first, then the row. If the object delete fails the row survives
      // and the admin can retry; dropping the row first would strand the
      // file in the bucket with nothing left pointing at it.
      await deleteFromR2(row.videoKey);
      if (row.posterKey) await deleteFromR2(row.posterKey);
      await d.delete(homeReels).where(eq(homeReels.id, input.id));

      return { success: true } as const;
    }),
});
