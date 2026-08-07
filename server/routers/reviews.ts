import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { reviews } from "../../drizzle/schema";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb, requireDb } from "../db";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  assertImageSize,
  deleteFromR2,
  uploadToR2,
} from "../_core/r2";

/**
 * Editable fields, shared by create and update so the two can't drift.
 * Exported for the tests — these bounds are the only thing between the
 * admin form and the column widths in the schema.
 */
export const reviewFields = {
  authorName: z.string().min(1).max(128),
  // 1-5, and an integer: the storefront renders this as a count of filled
  // stars, so 4.5 or 7 would both draw something nonsensical.
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(256),
  body: z.string().min(1).max(4000),
  // Optional, and empty is how it gets cleared — the card just omits the
  // product line when it's blank.
  productName: z.string().max(256).optional(),
  verified: z.boolean(),
  active: z.boolean(),
};

export const reviewsRouter = router({
  /**
   * What the home page renders. Inactive rows are filtered here rather than
   * in the client, so an unpublished review's text never reaches the page.
   */
  listPublic: publicProcedure.query(async () => {
    const d = await getDb();
    if (!d) return [];
    return d
      .select({
        id: reviews.id,
        authorName: reviews.authorName,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        productName: reviews.productName,
        verified: reviews.verified,
        imageUrl: reviews.imageUrl,
      })
      .from(reviews)
      .where(eq(reviews.active, true))
      .orderBy(asc(reviews.position), asc(reviews.id));
  }),

  list: adminProcedure.query(async () => {
    const d = await requireDb();
    return d
      .select()
      .from(reviews)
      .orderBy(asc(reviews.position), asc(reviews.id));
  }),

  create: adminProcedure
    .input(z.object(reviewFields))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      // Appended to the end. Reordering is a separate, explicit action.
      const existing = await d
        .select({ position: reviews.position })
        .from(reviews);
      const nextPosition =
        existing.reduce((max, r) => Math.max(max, r.position), -1) + 1;

      const [result] = await d.insert(reviews).values({
        ...input,
        productName: input.productName?.trim() || null,
        position: nextPosition,
      });
      return { id: Number(result.insertId) };
    }),

  update: adminProcedure
    .input(z.object({ id: z.number().int() }).extend(reviewFields))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const { id, ...data } = input;
      await d
        .update(reviews)
        .set({ ...data, productName: data.productName?.trim() || null })
        .where(eq(reviews.id, id));
      return { success: true } as const;
    }),

  /**
   * Takes the full ordered list of ids and rewrites every position from it.
   * Sending the whole order rather than "move id X up" keeps the result the
   * same however many moves were made, and stops two rows landing on the
   * same position.
   */
  reorder: adminProcedure
    .input(z.object({ ids: z.array(z.number().int()).max(200) }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      for (let i = 0; i < input.ids.length; i++) {
        await d
          .update(reviews)
          .set({ position: i })
          .where(eq(reviews.id, input.ids[i]));
      }
      return { success: true } as const;
    }),

  /**
   * Review photos are small enough to come through the API as base64, the
   * same way site assets and popup images do. Reels get a presigned upload
   * instead because video is two orders of magnitude bigger; a 5MB photo
   * does not justify the extra round trip.
   */
  uploadImage: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        fileBase64: z.string(),
        fileName: z.string().max(255),
        contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
      })
    )
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [review] = await d
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.id))
        .limit(1);
      if (!review)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found.",
        });

      const buffer = Buffer.from(input.fileBase64, "base64");
      assertImageSize(buffer);

      // Only the extension comes from the caller's filename, and only after
      // it survives a strict pattern — a filename is untrusted input and
      // pasting it into an object key is how `../` ends up in the path.
      const raw = input.fileName.split(".").pop()?.toLowerCase() ?? "";
      const ext = /^[a-z0-9]{1,5}$/.test(raw) ? raw : "bin";
      const key = `reviews/${input.id}/${Date.now()}.${ext}`;
      const url = await uploadToR2(key, buffer, input.contentType);

      // Replace: the old object goes only after the new one is safely up.
      if (review.imageKey) await deleteFromR2(review.imageKey);
      await d
        .update(reviews)
        .set({ imageKey: key, imageUrl: url })
        .where(eq(reviews.id, input.id));
      return { key, url };
    }),

  removeImage: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [review] = await d
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.id))
        .limit(1);
      if (!review)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found.",
        });

      if (review.imageKey) await deleteFromR2(review.imageKey);
      await d
        .update(reviews)
        .set({ imageKey: null, imageUrl: null })
        .where(eq(reviews.id, input.id));
      return { success: true } as const;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [review] = await d
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.id))
        .limit(1);
      if (!review)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found.",
        });

      // R2 first, then the row: a failed object delete leaves something
      // still pointing at the file rather than stranding it in the bucket.
      if (review.imageKey) await deleteFromR2(review.imageKey);
      await d.delete(reviews).where(eq(reviews.id, input.id));
      return { success: true } as const;
    }),
});
