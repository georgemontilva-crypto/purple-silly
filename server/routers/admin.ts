import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { labReportCategories, labReports, users } from "../../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

async function db() {
  const d = await getDb();
  if (!d) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return d;
}

export const adminRouter = router({
  // ─── STATS ───────────────────────────────────────────────────────
  stats: adminProcedure.query(async () => {
    const d = await db();
    const [userCount] = await d.select({ count: users.id }).from(users);
    const [reportCount] = await d.select({ count: labReports.id }).from(labReports);
    const [categoryCount] = await d.select({ count: labReportCategories.id }).from(labReportCategories);
    return {
      users: userCount?.count ?? 0,
      labReports: reportCount?.count ?? 0,
      categories: categoryCount?.count ?? 0,
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
        const { url } = await storagePut(key, buffer, input.contentType);
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
});
