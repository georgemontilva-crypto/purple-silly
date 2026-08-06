import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { requireDb as db } from "../db";
import { labReportCategories, labReports, siteAssets, users } from "../../drizzle/schema";
import { count, eq, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ASSET_SECTIONS, ASSET_SECTION_KEYS } from "../../shared/assetSections";
import { ALLOWED_IMAGE_MIME_TYPES as ALLOWED_ASSET_MIME_TYPES, MAX_IMAGE_BYTES as MAX_ASSET_BYTES, uploadToR2, deleteFromR2 } from "../_core/r2";

export const adminRouter = router({
  // ─── STATS ───────────────────────────────────────────────────────
  stats: adminProcedure.query(async () => {
    const d = await db();
    const [userCount] = await d.select({ value: count() }).from(users);
    const [reportCount] = await d.select({ value: count() }).from(labReports);
    const [categoryCount] = await d.select({ value: count() }).from(labReportCategories);
    return {
      users: userCount?.value ?? 0,
      labReports: reportCount?.value ?? 0,
      categories: categoryCount?.value ?? 0,
    };
  }),

  // ─── USERS ───────────────────────────────────────────────────────
  users: router({
    list: adminProcedure.query(async () => {
      const d = await db();
      return d.select().from(users).orderBy(desc(users.createdAt));
    }),
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        const d = await db();
        await d.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),

  // ─── LAB REPORT CATEGORIES ───────────────────────────────────────
  categories: router({
    list: publicProcedure.query(async () => {
      const d = await db();
      return d.select().from(labReportCategories).orderBy(asc(labReportCategories.sortOrder));
    }),
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        await d.insert(labReportCategories).values(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(128).optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        const { id, ...data } = input;
        await d.update(labReportCategories).set(data).where(eq(labReportCategories.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const d = await db();
        const reports = await d.select({ id: labReports.id })
          .from(labReports).where(eq(labReports.categoryId, input.id)).limit(1);
        if (reports.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete category with existing reports" });
        }
        await d.delete(labReportCategories).where(eq(labReportCategories.id, input.id));
        return { success: true };
      }),
  }),

  // ─── LAB REPORTS ─────────────────────────────────────────────────
  labReports: router({
    list: publicProcedure
      .input(z.object({ categoryId: z.number().optional(), publishedOnly: z.boolean().default(true) }))
      .query(async ({ input }) => {
        const d = await db();
        const rows = await d.select().from(labReports).orderBy(desc(labReports.createdAt));
        return rows.filter(r => {
          if (input.publishedOnly && r.isPublished !== 1) return false;
          if (input.categoryId && r.categoryId !== input.categoryId) return false;
          return true;
        });
      }),
    listAdmin: adminProcedure.query(async () => {
      const d = await db();
      return d.select().from(labReports).orderBy(desc(labReports.createdAt));
    }),
    create: adminProcedure
      .input(z.object({
        categoryId: z.number(),
        title: z.string().min(1).max(256),
        productName: z.string().optional(),
        batchNumber: z.string().optional(),
        testDate: z.string().optional(),
        fileBase64: z.string(),
        fileName: z.string(),
        contentType: z.string().default("application/pdf"),
        isPublished: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `lab-reports/${input.categoryId}/${Date.now()}-${input.fileName}`;
        const url = await uploadToR2(key, buffer, input.contentType);
        await d.insert(labReports).values({
          categoryId: input.categoryId,
          title: input.title,
          productName: input.productName,
          batchNumber: input.batchNumber,
          testDate: input.testDate,
          fileKey: key,
          fileUrl: url,
          fileName: input.fileName,
          isPublished: input.isPublished,
        });
        return { success: true, url };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        productName: z.string().optional(),
        batchNumber: z.string().optional(),
        testDate: z.string().optional(),
        isPublished: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        const { id, ...data } = input;
        await d.update(labReports).set(data).where(eq(labReports.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const d = await db();
        await d.delete(labReports).where(eq(labReports.id, input.id));
        return { success: true };
      }),
  }),

  // ─── SITE ASSETS (Cloudflare R2) ─────────────────────────────────
  assets: router({
    list: adminProcedure
      .input(z.object({ section: z.enum(ASSET_SECTION_KEYS).optional() }))
      .query(async ({ input }) => {
        const d = await db();
        const rows = await d.select().from(siteAssets)
          .orderBy(asc(siteAssets.section), asc(siteAssets.sortOrder), asc(siteAssets.id));
        if (input.section) return rows.filter(r => r.section === input.section);
        return rows;
      }),
    listPublic: publicProcedure
      .input(z.object({ section: z.enum(ASSET_SECTION_KEYS) }))
      .query(async ({ input }) => {
        const d = await db();
        // id as tiebreaker: multi-image sections can hold several rows at the
        // same sortOrder (uploaded before any reorder), and without it their
        // relative order would be whatever the DB happened to return —
        // i.e. the carousel could shuffle itself between requests.
        const rows = await d.select().from(siteAssets)
          .orderBy(asc(siteAssets.sortOrder), asc(siteAssets.id));
        return rows.filter(r => r.section === input.section);
      }),
    upload: adminProcedure
      .input(z.object({
        section: z.enum(ASSET_SECTION_KEYS),
        label: z.string().min(1).max(256),
        fileBase64: z.string(),
        fileName: z.string(),
        contentType: z.enum(ALLOWED_ASSET_MIME_TYPES),
        width: z.number().optional(),
        height: z.number().optional(),
        // Omitted by the admin UI: multi-image sections (hero-carousel) need
        // each new upload APPENDED after the existing ones, and only the
        // server knows what's already there. A caller can still pin an
        // explicit position.
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        const buffer = Buffer.from(input.fileBase64, "base64");

        if (buffer.length > MAX_ASSET_BYTES) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Image is too large. Max ${MAX_ASSET_BYTES / (1024 * 1024)}MB.`,
          });
        }

        const maxImages = ASSET_SECTIONS[input.section].maxImages;
        const [{ value: existingCount }] = await d
          .select({ value: count() })
          .from(siteAssets)
          .where(eq(siteAssets.section, input.section));
        if (existingCount >= maxImages) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${ASSET_SECTIONS[input.section].label}" already has the maximum of ${maxImages} image${maxImages === 1 ? "" : "s"}. Delete one before uploading another.`,
          });
        }

        const ext = input.fileName.split(".").pop() ?? "bin";
        const key = `site-assets/${input.section}/${Date.now()}-${input.label.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
        const url = await uploadToR2(key, buffer, input.contentType);
        await d.insert(siteAssets).values({
          section: input.section,
          label: input.label,
          key,
          url,
          mimeType: input.contentType,
          sizeBytes: buffer.length,
          width: input.width,
          height: input.height,
          // existingCount is the count for THIS section (read above for the
          // maxImages check), so it doubles as the next free slot.
          sortOrder: input.sortOrder ?? existingCount,
        });
        return { success: true, url, key };
      }),
    /**
     * Drag & drop ordering for multi-image sections. Takes the full,
     * already-reordered id list for one section and rewrites sortOrder to
     * match its index — sending positions rather than a "move id X to Y"
     * delta keeps the result identical no matter how the client got there.
     *
     * Ids are validated against the section before anything is written: an
     * id from a DIFFERENT section would otherwise have its sortOrder
     * silently rewritten, scrambling that other section's order.
     */
    reorder: adminProcedure
      .input(z.object({
        section: z.enum(ASSET_SECTION_KEYS),
        orderedIds: z.array(z.number()).min(1),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        const rows = await d
          .select({ id: siteAssets.id })
          .from(siteAssets)
          .where(eq(siteAssets.section, input.section));
        const owned = new Set(rows.map(r => r.id));
        const foreign = input.orderedIds.filter(id => !owned.has(id));
        if (foreign.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Asset ids [${foreign.join(", ")}] don't belong to section "${input.section}".`,
          });
        }
        await Promise.all(
          input.orderedIds.map((id, index) =>
            d.update(siteAssets).set({ sortOrder: index }).where(eq(siteAssets.id, id))
          )
        );
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        label: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        const { id, ...data } = input;
        await d.update(siteAssets).set(data).where(eq(siteAssets.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const d = await db();
        const [asset] = await d.select().from(siteAssets).where(eq(siteAssets.id, input.id)).limit(1);
        if (asset) {
          await deleteFromR2(asset.key);
          await d.delete(siteAssets).where(eq(siteAssets.id, input.id));
        }
        return { success: true };
      }),
  }),
});
