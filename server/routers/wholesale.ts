import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { wholesaleApplications } from "../../drizzle/schema";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { requireDb } from "../db";
import { createPresignedUpload, deleteFromR2 } from "../_core/r2";
import { enforceRateLimit, getClientIp } from "../_core/rateLimit";

export const DISTRIBUTOR_TYPES = [
  "1 Store",
  "2-5 Store",
  "5+ Store",
  "Distributor",
] as const;

export const APPLICATION_STATUSES = [
  "new",
  "contacted",
  "approved",
  "rejected",
] as const;

/**
 * What a wholesale attachment may be: a licence, a resale certificate, a
 * line sheet. PDFs and photos cover almost all of it; the two Office types
 * are there because plenty of small retailers still send a .doc.
 */
export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Editable fields, exported so the public form mirrors exactly these
 * bounds — they're the only thing between the form and the column widths
 * in the schema.
 */
export const wholesaleFields = {
  businessName: z.string().min(1).max(256),
  dba: z.string().min(1).max(256),
  firstName: z.string().min(1).max(128),
  lastName: z.string().min(1).max(128),
  phone: z.string().min(1).max(64),
  email: z.string().email().max(320),
  address: z.string().min(1).max(512),
  city: z.string().min(1).max(128),
  state: z.string().min(1).max(128),
  postalCode: z.string().min(1).max(32),
  country: z.string().min(1).max(128),
  distributorType: z.enum(DISTRIBUTOR_TYPES),
  // The only two optional fields on the form.
  notes: z.string().max(4000).optional(),
  fileKey: z.string().max(512).optional(),
  fileUrl: z.string().url().max(1024).optional(),
  fileName: z.string().max(255).optional(),
};

/**
 * Object key for an attachment. The caller's filename never reaches the
 * key — only its extension, and only after a strict pattern, because a
 * filename is untrusted input and pasting it into a key is how `../` or a
 * query string ends up in the path. Same rule as reelKey; see CLAUDE.md.
 */
export function attachmentKey(fileName: string): string {
  const raw = fileName.includes(".")
    ? fileName.split(".").pop()!.toLowerCase()
    : "";
  const ext = /^[a-z0-9]{1,5}$/.test(raw) ? raw : "bin";
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `wholesale/${stamp}-${rand}.${ext}`;
}

export const wholesaleRouter = router({
  /**
   * Signs a short-lived PUT so the browser uploads straight to R2.
   *
   * Public, because the form it serves is public — so it's rate limited by
   * IP. Without that, an open endpoint that mints upload URLs is an open
   * invitation to fill someone else's bucket.
   */
  createUploadUrl: publicProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        contentType: z.string().min(1).max(128),
        fileSize: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit(
        `wholesale-upload:${getClientIp(ctx.req)}`,
        10,
        60 * 60 * 1000
      );

      if (
        !(ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(
          input.contentType
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Unsupported file type. Please attach a PDF, image or Word document.",
        });
      }
      if (input.fileSize > MAX_ATTACHMENT_BYTES) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File is too large. Max ${MAX_ATTACHMENT_BYTES / (1024 * 1024)}MB.`,
        });
      }

      const key = attachmentKey(input.fileName);
      const { uploadUrl, publicUrl } = await createPresignedUpload(
        key,
        input.contentType
      );
      return { key, uploadUrl, publicUrl };
    }),

  /**
   * The public form's submit.
   *
   * Rate limited per IP: this writes a row on every call and there is no
   * captcha in front of it. `status` is never accepted from the client —
   * an applicant does not get to mark themselves approved.
   */
  submit: publicProcedure
    .input(z.object(wholesaleFields))
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit(`wholesale:${getClientIp(ctx.req)}`, 5, 60 * 60 * 1000);

      const d = await requireDb();
      const [result] = await d.insert(wholesaleApplications).values({
        ...input,
        email: input.email.trim().toLowerCase(),
        notes: input.notes?.trim() || null,
        fileKey: input.fileKey || null,
        fileUrl: input.fileUrl || null,
        fileName: input.fileName || null,
        status: "new",
      });

      // No email notification yet — Resend isn't configured. The row IS the
      // record; when Resend lands, the send goes here.
      return { id: Number(result.insertId), success: true } as const;
    }),

  list: adminProcedure
    .input(
      z
        .object({
          search: z.string().max(128).optional(),
          status: z.enum(APPLICATION_STATUSES).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const d = await requireDb();
      const term = input?.search?.trim();

      const filters = [];
      if (input?.status)
        filters.push(eq(wholesaleApplications.status, input.status));
      if (term) {
        const pattern = `%${term}%`;
        filters.push(
          or(
            like(wholesaleApplications.businessName, pattern),
            like(wholesaleApplications.dba, pattern),
            like(wholesaleApplications.email, pattern),
            like(wholesaleApplications.firstName, pattern),
            like(wholesaleApplications.lastName, pattern),
            like(wholesaleApplications.city, pattern),
            like(wholesaleApplications.state, pattern)
          )
        );
      }

      const query = d.select().from(wholesaleApplications);
      // Newest first: this is a queue, and the top of it is what gets worked.
      return filters.length
        ? query
            .where(and(...filters))
            .orderBy(desc(wholesaleApplications.createdAt))
        : query.orderBy(desc(wholesaleApplications.createdAt));
    }),

  setStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(APPLICATION_STATUSES),
      })
    )
    .mutation(async ({ input }) => {
      const d = await requireDb();
      await d
        .update(wholesaleApplications)
        .set({ status: input.status })
        .where(eq(wholesaleApplications.id, input.id));
      return { success: true } as const;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const d = await requireDb();
      const [row] = await d
        .select()
        .from(wholesaleApplications)
        .where(eq(wholesaleApplications.id, input.id))
        .limit(1);
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Application not found",
        });
      }

      // R2 first, then the row: a failed object delete leaves something
      // still pointing at the file rather than stranding it in the bucket.
      if (row.fileKey) await deleteFromR2(row.fileKey);
      await d
        .delete(wholesaleApplications)
        .where(eq(wholesaleApplications.id, input.id));
      return { success: true } as const;
    }),
});
