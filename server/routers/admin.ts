import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { labReportCategories, labReports, siteAssets, users } from "../../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { storagePut } from "../storage";

// ─── Cloudflare R2 client (falls back to Manus storage if R2 not configured) ─
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!client || !bucket || !publicUrl) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "R2 not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL to your environment variables." });
  }
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!client || !bucket) return; // silently skip if not configured
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

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

  // ─── SITE ASSETS (Cloudflare R2) ─────────────────────────────────
  assets: router({
    list: adminProcedure
      .input(z.object({ section: z.string().optional() }))
      .query(async ({ input }) => {
        const d = await db();
        const rows = await d.select().from(siteAssets).orderBy(asc(siteAssets.section), asc(siteAssets.sortOrder));
        if (input.section) return rows.filter(r => r.section === input.section);
        return rows;
      }),
    listPublic: publicProcedure
      .input(z.object({ section: z.string() }))
      .query(async ({ input }) => {
        const d = await db();
        const rows = await d.select().from(siteAssets)
          .orderBy(asc(siteAssets.sortOrder));
        return rows.filter(r => r.section === input.section);
      }),
    upload: adminProcedure
      .input(z.object({
        section: z.string().min(1).max(128),
        label: z.string().min(1).max(256),
        fileBase64: z.string(),
        fileName: z.string(),
        contentType: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const d = await db();
        const buffer = Buffer.from(input.fileBase64, "base64");
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
          sortOrder: input.sortOrder,
        });
        return { success: true, url, key };
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
