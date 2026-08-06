import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  productBundles,
  productCategories,
  productImages,
  products,
  productVariants,
} from "../../drizzle/schema";
import { slugify } from "../../shared/slugify";
import { adminProcedure, router } from "../_core/trpc";
import { ALLOWED_IMAGE_MIME_TYPES, assertImageSize, deleteFromR2, uploadToR2 } from "../_core/r2";
import { requireDb } from "../db";
import { TRPCError } from "@trpc/server";

type Db = Awaited<ReturnType<typeof requireDb>>;

async function resolveProductSlug(
  d: Db,
  title: string,
  explicitSlug: string | undefined,
  excludeId?: number
): Promise<string> {
  if (explicitSlug) {
    const candidate = slugify(explicitSlug);
    const [existing] = await d.select({ id: products.id }).from(products).where(eq(products.slug, candidate)).limit(1);
    if (existing && existing.id !== excludeId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Slug "${candidate}" is already in use.` });
    }
    return candidate;
  }
  const base = slugify(title) || "product";
  let candidate = base;
  let n = 2;
  for (;;) {
    const [existing] = await d.select({ id: products.id }).from(products).where(eq(products.slug, candidate)).limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
}

async function resolveCategorySlug(
  d: Db,
  name: string,
  explicitSlug: string | undefined,
  excludeId?: number
): Promise<string> {
  if (explicitSlug) {
    const candidate = slugify(explicitSlug);
    const [existing] = await d
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(eq(productCategories.slug, candidate))
      .limit(1);
    if (existing && existing.id !== excludeId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Slug "${candidate}" is already in use.` });
    }
    return candidate;
  }
  const base = slugify(name) || "category";
  let candidate = base;
  let n = 2;
  for (;;) {
    const [existing] = await d
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(eq(productCategories.slug, candidate))
      .limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
}

async function uploadImageField(input: {
  imageBase64?: string;
  imageFileName?: string;
  imageContentType?: (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
}, keyPrefix: string): Promise<{ imageKey: string; imageUrl: string } | null> {
  if (!input.imageBase64 || !input.imageFileName || !input.imageContentType) return null;
  const buffer = Buffer.from(input.imageBase64, "base64");
  assertImageSize(buffer);
  const ext = input.imageFileName.split(".").pop() ?? "bin";
  const imageKey = `${keyPrefix}/${Date.now()}.${ext}`;
  const imageUrl = await uploadToR2(imageKey, buffer, input.imageContentType);
  return { imageKey, imageUrl };
}

const imageUploadFields = {
  imageBase64: z.string().optional(),
  imageFileName: z.string().optional(),
  imageContentType: z.enum(ALLOWED_IMAGE_MIME_TYPES).optional(),
};

// Second, independent image slot on categories — the "Choose Your Ride" card
// image. Distinct field names since a zod object can't have two keys both
// named imageBase64.
const cardImageUploadFields = {
  cardImageBase64: z.string().optional(),
  cardImageFileName: z.string().optional(),
  cardImageContentType: z.enum(ALLOWED_IMAGE_MIME_TYPES).optional(),
};

const productStatus = z.enum(["draft", "active", "archived"]);

export const adminCatalogRouter = router({
  // ─── PRODUCT CATEGORIES (separate from lab_report_categories) ────
  categories: router({
    list: adminProcedure.query(async () => {
      const d = await requireDb();
      return d.select().from(productCategories).orderBy(asc(productCategories.sortOrder));
    }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(128),
          slug: z.string().max(128).optional(),
          description: z.string().optional(),
          sortOrder: z.number().int().default(0),
          ...imageUploadFields,
          ...cardImageUploadFields,
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const slug = await resolveCategorySlug(d, input.name, input.slug);
        const image = await uploadImageField(input, "product-categories");
        const cardImage = await uploadImageField(
          {
            imageBase64: input.cardImageBase64,
            imageFileName: input.cardImageFileName,
            imageContentType: input.cardImageContentType,
          },
          "product-categories/card"
        );
        const [result] = await d.insert(productCategories).values({
          name: input.name,
          slug,
          description: input.description,
          sortOrder: input.sortOrder,
          imageKey: image?.imageKey,
          imageUrl: image?.imageUrl,
          cardImageKey: cardImage?.imageKey,
          cardImageUrl: cardImage?.imageUrl,
        });
        return { success: true, id: result.insertId, slug };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(128).optional(),
          slug: z.string().max(128).optional(),
          description: z.string().optional(),
          sortOrder: z.number().int().optional(),
          ...imageUploadFields,
          ...cardImageUploadFields,
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const {
          id,
          slug: rawSlug,
          imageBase64,
          imageFileName,
          imageContentType,
          cardImageBase64,
          cardImageFileName,
          cardImageContentType,
          ...rest
        } = input;
        const data: Record<string, unknown> = { ...rest };
        if (rawSlug !== undefined) {
          data.slug = await resolveCategorySlug(d, rest.name ?? "", rawSlug, id);
        }
        const image = await uploadImageField({ imageBase64, imageFileName, imageContentType }, "product-categories");
        if (image) {
          data.imageKey = image.imageKey;
          data.imageUrl = image.imageUrl;
        }
        const cardImage = await uploadImageField(
          { imageBase64: cardImageBase64, imageFileName: cardImageFileName, imageContentType: cardImageContentType },
          "product-categories/card"
        );
        if (cardImage) {
          data.cardImageKey = cardImage.imageKey;
          data.cardImageUrl = cardImage.imageUrl;
        }
        await d.update(productCategories).set(data).where(eq(productCategories.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const [existing] = await d
          .select({ id: products.id })
          .from(products)
          .where(eq(products.categoryId, input.id))
          .limit(1);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete a category with existing products" });
        }
        const [cat] = await d.select().from(productCategories).where(eq(productCategories.id, input.id)).limit(1);
        if (cat?.imageKey) await deleteFromR2(cat.imageKey);
        if (cat?.cardImageKey) await deleteFromR2(cat.cardImageKey);
        await d.delete(productCategories).where(eq(productCategories.id, input.id));
        return { success: true };
      }),
  }),

  // ─── PRODUCTS ──────────────────────────────────────────────────────
  products: router({
    list: adminProcedure
      .input(
        z
          .object({
            search: z.string().optional(),
            status: productStatus.optional(),
            categoryId: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const d = await requireDb();
        const filters = input ?? {};
        const conditions = [];
        if (filters.status) conditions.push(eq(products.status, filters.status));
        if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));

        const rows = conditions.length
          ? await d.select().from(products).where(and(...conditions)).orderBy(desc(products.updatedAt))
          : await d.select().from(products).orderBy(desc(products.updatedAt));

        const searched = filters.search
          ? rows.filter(p => p.title.toLowerCase().includes((filters.search as string).toLowerCase()))
          : rows;

        if (searched.length === 0) return [];

        const ids = searched.map(p => p.id);
        const [variantRows, imageRows, categoryRows] = await Promise.all([
          d.select().from(productVariants).where(inArray(productVariants.productId, ids)),
          d
            .select()
            .from(productImages)
            .where(inArray(productImages.productId, ids))
            .orderBy(asc(productImages.position)),
          d.select().from(productCategories),
        ]);
        const categoryById = new Map(categoryRows.map(c => [c.id, c]));

        return searched.map(p => {
          const variants = variantRows.filter(v => v.productId === p.id);
          const primaryImage = imageRows.find(img => img.productId === p.id);
          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status,
            featured: p.featured,
            categoryId: p.categoryId,
            categoryName: p.categoryId ? (categoryById.get(p.categoryId)?.name ?? null) : null,
            imageUrl: primaryImage?.url ?? null,
            totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
            variantCount: variants.length,
          };
        });
      }),

    get: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const d = await requireDb();
      const [product] = await d.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      const [variants, bundles, images] = await Promise.all([
        d.select().from(productVariants).where(eq(productVariants.productId, product.id)).orderBy(asc(productVariants.position)),
        d.select().from(productBundles).where(eq(productBundles.productId, product.id)).orderBy(asc(productBundles.position)),
        d.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.position)),
      ]);
      return { ...product, variants, bundles, images };
    }),

    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(256),
          slug: z.string().max(256).optional(),
          description: z.string().optional(),
          status: productStatus.default("draft"),
          featured: z.boolean().default(false),
          categoryId: z.number().nullable().optional(),
          tags: z.array(z.string().max(64)).default([]),
          seoTitle: z.string().max(256).optional(),
          seoDescription: z.string().max(512).optional(),
          ingredients: z.string().optional(),
          howToTake: z.string().optional(),
          disclaimer: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const slug = await resolveProductSlug(d, input.title, input.slug);
        const [result] = await d.insert(products).values({
          title: input.title,
          slug,
          description: input.description,
          status: input.status,
          featured: input.featured,
          categoryId: input.categoryId ?? null,
          tags: input.tags,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          ingredients: input.ingredients,
          howToTake: input.howToTake,
          disclaimer: input.disclaimer,
        });
        return { success: true, id: result.insertId, slug };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(256).optional(),
          slug: z.string().max(256).optional(),
          description: z.string().optional(),
          status: productStatus.optional(),
          featured: z.boolean().optional(),
          categoryId: z.number().nullable().optional(),
          tags: z.array(z.string().max(64)).optional(),
          seoTitle: z.string().max(256).optional(),
          seoDescription: z.string().max(512).optional(),
          ingredients: z.string().optional(),
          howToTake: z.string().optional(),
          disclaimer: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const { id, slug: rawSlug, title, ...rest } = input;
        const [existing] = await d.select().from(products).where(eq(products.id, id)).limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

        // Slug never changes just because the title did — only an explicit
        // slug edit touches the URL, so existing links don't silently break.
        const data: Record<string, unknown> = { ...rest };
        if (title !== undefined) data.title = title;
        if (rawSlug !== undefined) {
          data.slug = await resolveProductSlug(d, title ?? existing.title, rawSlug, id);
        }

        await d.update(products).set(data).where(eq(products.id, id));
        return { success: true };
      }),

    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const d = await requireDb();
      const [variants, images] = await Promise.all([
        d.select().from(productVariants).where(eq(productVariants.productId, input.id)),
        d.select().from(productImages).where(eq(productImages.productId, input.id)),
      ]);
      await Promise.all([
        ...images.map(img => deleteFromR2(img.r2Key)),
        ...variants.filter((v): v is typeof v & { imageKey: string } => Boolean(v.imageKey)).map(v => deleteFromR2(v.imageKey)),
      ]);
      await d.delete(productImages).where(eq(productImages.productId, input.id));
      await d.delete(productVariants).where(eq(productVariants.productId, input.id));
      await d.delete(productBundles).where(eq(productBundles.productId, input.id));
      await d.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
  }),

  // ─── VARIANTS ──────────────────────────────────────────────────────
  variants: router({
    create: adminProcedure
      .input(
        z.object({
          productId: z.number(),
          title: z.string().min(1).max(128),
          sku: z.string().max(128).optional(),
          priceCents: z.number().int().min(0),
          compareAtCents: z.number().int().min(0).nullable().optional(),
          stock: z.number().int().min(0).default(0),
          position: z.number().int().default(0),
          ...imageUploadFields,
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const image = await uploadImageField(input, `products/${input.productId}/variants`);
        const [result] = await d.insert(productVariants).values({
          productId: input.productId,
          title: input.title,
          sku: input.sku,
          priceCents: input.priceCents,
          compareAtCents: input.compareAtCents ?? null,
          stock: input.stock,
          position: input.position,
          imageKey: image?.imageKey,
          imageUrl: image?.imageUrl,
        });
        return { success: true, id: result.insertId };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(128).optional(),
          sku: z.string().max(128).optional(),
          priceCents: z.number().int().min(0).optional(),
          compareAtCents: z.number().int().min(0).nullable().optional(),
          stock: z.number().int().min(0).optional(),
          position: z.number().int().optional(),
          ...imageUploadFields,
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const { id, imageBase64, imageFileName, imageContentType, ...rest } = input;
        const [existing] = await d.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Variant not found" });
        const data: Record<string, unknown> = { ...rest };
        const image = await uploadImageField({ imageBase64, imageFileName, imageContentType }, `products/${existing.productId}/variants`);
        if (image) {
          if (existing.imageKey) await deleteFromR2(existing.imageKey);
          data.imageKey = image.imageKey;
          data.imageUrl = image.imageUrl;
        }
        await d.update(productVariants).set(data).where(eq(productVariants.id, id));
        return { success: true };
      }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const d = await requireDb();
      const [v] = await d.select().from(productVariants).where(eq(productVariants.id, input.id)).limit(1);
      if (v?.imageKey) await deleteFromR2(v.imageKey);
      await d.delete(productVariants).where(eq(productVariants.id, input.id));
      return { success: true };
    }),
  }),

  // ─── BUNDLES ───────────────────────────────────────────────────────
  bundles: router({
    create: adminProcedure
      .input(
        z.object({
          productId: z.number(),
          label: z.string().min(1).max(128),
          quantity: z.number().int().min(1),
          priceCents: z.number().int().min(0),
          compareAtCents: z.number().int().min(0).nullable().optional(),
          badge: z.string().max(64).optional(),
          position: z.number().int().default(0),
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const [result] = await d.insert(productBundles).values({
          ...input,
          compareAtCents: input.compareAtCents ?? null,
        });
        return { success: true, id: result.insertId };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          label: z.string().min(1).max(128).optional(),
          quantity: z.number().int().min(1).optional(),
          priceCents: z.number().int().min(0).optional(),
          compareAtCents: z.number().int().min(0).nullable().optional(),
          badge: z.string().max(64).optional(),
          position: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const { id, ...data } = input;
        await d.update(productBundles).set(data).where(eq(productBundles.id, id));
        return { success: true };
      }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const d = await requireDb();
      await d.delete(productBundles).where(eq(productBundles.id, input.id));
      return { success: true };
    }),
  }),

  // ─── GALLERY IMAGES ────────────────────────────────────────────────
  images: router({
    upload: adminProcedure
      .input(
        z.object({
          productId: z.number(),
          fileBase64: z.string(),
          fileName: z.string(),
          contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
          alt: z.string().max(256).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const d = await requireDb();
        const buffer = Buffer.from(input.fileBase64, "base64");
        assertImageSize(buffer);
        const [{ value: currentCount }] = await d
          .select({ value: count() })
          .from(productImages)
          .where(eq(productImages.productId, input.productId));
        const ext = input.fileName.split(".").pop() ?? "bin";
        const key = `products/${input.productId}/${Date.now()}.${ext}`;
        const url = await uploadToR2(key, buffer, input.contentType);
        const [result] = await d.insert(productImages).values({
          productId: input.productId,
          r2Key: key,
          url,
          alt: input.alt,
          position: currentCount,
        });
        return { success: true, id: result.insertId, url };
      }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const d = await requireDb();
      const [img] = await d.select().from(productImages).where(eq(productImages.id, input.id)).limit(1);
      if (img) {
        await deleteFromR2(img.r2Key);
        await d.delete(productImages).where(eq(productImages.id, input.id));
      }
      return { success: true };
    }),
    reorder: adminProcedure
      .input(z.object({ productId: z.number(), orderedIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const d = await requireDb();
        await Promise.all(
          input.orderedIds.map((id, index) =>
            d
              .update(productImages)
              .set({ position: index })
              .where(and(eq(productImages.id, id), eq(productImages.productId, input.productId)))
          )
        );
        return { success: true };
      }),
  }),
});
