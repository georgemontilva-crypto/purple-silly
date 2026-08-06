import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  productBundles,
  productCategories,
  productImages,
  products,
  productVariants,
} from "../../drizzle/schema";
import { publicProcedure, router } from "../_core/trpc";
import { requireDb } from "../db";

/** Cheapest variant of a product — what a "from $X" card price is based on. */
function cheapestVariant<T extends { priceCents: number }>(variants: T[]): T | null {
  if (variants.length === 0) return null;
  return variants.reduce((a, b) => (a.priceCents <= b.priceCents ? a : b));
}

export const catalogRouter = router({
  // Only categories that have at least one active product, ordered the way
  // the admin arranged them. An empty catalog (or a category nobody has
  // published a product into yet) never shows up here — the storefront
  // decides what to render (or not) based on this, not on raw category rows.
  categories: publicProcedure.query(async () => {
    const d = await requireDb();
    const [cats, activeProducts] = await Promise.all([
      d.select().from(productCategories).orderBy(asc(productCategories.sortOrder)),
      d.select({ categoryId: products.categoryId }).from(products).where(eq(products.status, "active")),
    ]);
    const categoryIdsWithProducts = new Set(
      activeProducts.map(p => p.categoryId).filter((id): id is number => id !== null)
    );
    return cats.filter(c => categoryIdsWithProducts.has(c.id));
  }),

  list: publicProcedure
    .input(
      z
        .object({
          categorySlug: z.string().optional(),
          tag: z.string().optional(),
          featured: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const d = await requireDb();
      const filters = input ?? { limit: 50 };

      let categoryId: number | undefined;
      if (filters.categorySlug) {
        const [cat] = await d
          .select({ id: productCategories.id })
          .from(productCategories)
          .where(eq(productCategories.slug, filters.categorySlug))
          .limit(1);
        if (!cat) return [];
        categoryId = cat.id;
      }

      const conditions = [eq(products.status, "active")];
      if (categoryId !== undefined) conditions.push(eq(products.categoryId, categoryId));
      if (filters.featured !== undefined) conditions.push(eq(products.featured, filters.featured));

      const rows = await d
        .select()
        .from(products)
        .where(and(...conditions))
        .limit(filters.limit);

      const filtered = filters.tag
        ? rows.filter(p => (p.tags as string[]).includes(filters.tag as string))
        : rows;

      if (filtered.length === 0) return [];

      const productIds = filtered.map(p => p.id);
      const [variantRows, imageRows, categoryRows] = await Promise.all([
        d.select().from(productVariants).where(inArray(productVariants.productId, productIds)),
        d
          .select()
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.position)),
        d.select().from(productCategories),
      ]);
      const categoryById = new Map(categoryRows.map(c => [c.id, c]));

      return filtered.map(p => {
        const variants = variantRows.filter(v => v.productId === p.id);
        const cheapest = cheapestVariant(variants);
        const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
        const primaryImage = imageRows.find(img => img.productId === p.id);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          featured: p.featured,
          priceCents: cheapest?.priceCents ?? null,
          compareAtCents: cheapest?.compareAtCents ?? null,
          imageUrl: primaryImage?.url ?? null,
          imageAlt: primaryImage?.alt ?? p.title,
          inStock: totalStock > 0,
          categoryId: p.categoryId,
          categoryName: p.categoryId ? (categoryById.get(p.categoryId)?.name ?? null) : null,
          categorySlug: p.categoryId ? (categoryById.get(p.categoryId)?.slug ?? null) : null,
        };
      });
    }),

  product: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const d = await requireDb();
    const [product] = await d
      .select()
      .from(products)
      .where(and(eq(products.slug, input.slug), eq(products.status, "active")))
      .limit(1);
    if (!product) return null;

    const [variants, bundles, images, category] = await Promise.all([
      d
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id))
        .orderBy(asc(productVariants.position)),
      d
        .select()
        .from(productBundles)
        .where(eq(productBundles.productId, product.id))
        .orderBy(asc(productBundles.position)),
      d
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(asc(productImages.position)),
      product.categoryId
        ? d
            .select()
            .from(productCategories)
            .where(eq(productCategories.id, product.categoryId))
            .limit(1)
            .then(r => r[0])
        : Promise.resolve(undefined),
    ]);

    return { ...product, variants, bundles, images, category: category ?? null };
  }),
});
