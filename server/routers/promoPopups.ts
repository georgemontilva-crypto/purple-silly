import { asc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { promoPopups } from "../../drizzle/schema";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb, requireDb } from "../db";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  assertImageSize,
  deleteFromR2,
  uploadToR2,
} from "../_core/r2";

/**
 * Clears `active` on every popup except the given one. Called from every
 * path that can turn a popup on, so the "only one active at a time" rule
 * holds no matter which one the admin used.
 */
async function deactivateOthers(
  d: Awaited<ReturnType<typeof requireDb>>,
  keepId: number
): Promise<void> {
  await d.update(promoPopups).set({ active: false }).where(ne(promoPopups.id, keepId));
}

/**
 * Editable fields, shared by create and update so the two can't drift.
 * Exported for the tests — the bounds here are the only thing standing
 * between the admin form and the column widths in the schema.
 */
export const popupFields = {
  title: z.string().min(1).max(256),
  subtitle: z.string().max(512).optional(),
  bodyText: z.string().max(2000).optional(),
  discountCode: z.string().min(1).max(64),
  buttonText: z.string().min(1).max(128),
  // Corner-ribbon caption. Optional end to end: absent or empty means no
  // ribbon is rendered, so it's opt-in per popup.
  ribbonText: z.string().max(48).optional(),
  // Capped at two minutes: a longer delay means the popup effectively
  // never fires for a normal visit, which reads as "it's broken".
  showDelaySeconds: z.number().int().min(0).max(120),
  active: z.boolean(),
};

export const popupInputSchema = z.object(popupFields);

export const promoPopupsRouter = router({
  /**
   * The single active popup, or null. Consumed on every storefront page,
   * so it uses getDb (not requireDb): with no database reachable the
   * popup simply doesn't appear, rather than throwing on every page load.
   *
   * imageKey is stripped — it's the internal R2 object key and the client
   * only ever needs imageUrl.
   *
   * discountCode IS included for everyone, deliberately. The logged-in /
   * anonymous split in the UI is about FRICTION, not secrecy: a signed-in
   * visitor already gave us their email, so we don't ask twice. The code
   * itself is promotional material meant to be spread around — gating it
   * server-side would buy nothing, since anyone can read it out of the
   * response either way, and would mean the popup couldn't reveal it
   * immediately after the email is submitted.
   */
  active: publicProcedure.query(async () => {
    const d = await getDb();
    if (!d) return null;
    const [row] = await d
      .select()
      .from(promoPopups)
      .where(eq(promoPopups.active, true))
      .limit(1);
    if (!row) return null;
    const { imageKey: _imageKey, ...rest } = row;
    return rest;
  }),

  list: adminProcedure.query(async () => {
    const d = await requireDb();
    return d.select().from(promoPopups).orderBy(asc(promoPopups.id));
  }),

  create: adminProcedure
    .input(z.object(popupFields))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [result] = await d.insert(promoPopups).values(input);
      const id = Number(result.insertId);
      if (input.active) await deactivateOthers(d, id);
      return { id };
    }),

  update: adminProcedure
    .input(z.object({ id: z.number() }).extend(popupFields))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const { id, ...data } = input;
      await d.update(promoPopups).set(data).where(eq(promoPopups.id, id));
      if (data.active) await deactivateOthers(d, id);
      return { success: true };
    }),

  /** The list's one-click "activate" (and the editor's toggle). */
  setActive: adminProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      await d
        .update(promoPopups)
        .set({ active: input.active })
        .where(eq(promoPopups.id, input.id));
      if (input.active) await deactivateOthers(d, input.id);
      return { success: true };
    }),

  /**
   * Attaches the side image. Requires an existing popup so the R2 object
   * is always owned by a row — an upload held in form state before the
   * first save would orphan the object in the bucket if the admin walked
   * away. Replacing an image deletes the old object first.
   */
  uploadImage: adminProcedure
    .input(
      z.object({
        id: z.number(),
        fileBase64: z.string(),
        fileName: z.string(),
        contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
      })
    )
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [popup] = await d
        .select()
        .from(promoPopups)
        .where(eq(promoPopups.id, input.id))
        .limit(1);
      if (!popup) throw new TRPCError({ code: "NOT_FOUND", message: "Popup not found." });

      const buffer = Buffer.from(input.fileBase64, "base64");
      assertImageSize(buffer);

      const ext = input.fileName.split(".").pop() ?? "bin";
      const key = `promo-popups/${input.id}/${Date.now()}.${ext}`;
      const url = await uploadToR2(key, buffer, input.contentType);

      if (popup.imageKey) await deleteFromR2(popup.imageKey);
      await d
        .update(promoPopups)
        .set({ imageKey: key, imageUrl: url })
        .where(eq(promoPopups.id, input.id));
      return { key, url };
    }),

  removeImage: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [popup] = await d
        .select()
        .from(promoPopups)
        .where(eq(promoPopups.id, input.id))
        .limit(1);
      if (popup?.imageKey) await deleteFromR2(popup.imageKey);
      await d
        .update(promoPopups)
        .set({ imageKey: null, imageUrl: null })
        .where(eq(promoPopups.id, input.id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [popup] = await d
        .select()
        .from(promoPopups)
        .where(eq(promoPopups.id, input.id))
        .limit(1);
      if (!popup) return { success: true };
      // R2 first: if the row went away and this then failed, the object
      // would be unreachable through the admin and leak in the bucket.
      if (popup.imageKey) await deleteFromR2(popup.imageKey);
      await d.delete(promoPopups).where(eq(promoPopups.id, input.id));
      return { success: true };
    }),
});
