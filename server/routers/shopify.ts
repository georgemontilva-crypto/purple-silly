import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getProducts,
  getProductByHandle,
  getCollections,
  getShopifyToken,
} from "../shopify";

export const shopifyRouter = router({
  // Test connection
  ping: publicProcedure.query(async () => {
    try {
      await getShopifyToken();
      return { ok: true, shop: process.env.SHOPIFY_SHOP ?? "" };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }),

  // Get all products or products by collection
  products: publicProcedure
    .input(
      z.object({
        first: z.number().min(1).max(50).default(20),
        collection: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const products = await getProducts(input?.first ?? 20, input?.collection);
      return products;
    }),

  // Get single product by handle
  product: publicProcedure
    .input(z.object({ handle: z.string() }))
    .query(async ({ input }) => {
      const product = await getProductByHandle(input.handle);
      return product;
    }),

  // Get collections
  collections: publicProcedure
    .input(z.object({ first: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      const collections = await getCollections(input?.first ?? 10);
      return collections;
    }),

  // Create checkout URL via Storefront API (redirect to Shopify checkout)
  createCheckout: publicProcedure
    .input(
      z.object({
        lines: z.array(
          z.object({
            variantId: z.string(),
            quantity: z.number().min(1),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const shop = process.env.SHOPIFY_SHOP ?? "";
      // Build a Shopify checkout URL using variant IDs
      // Format: https://{shop}/cart/{variantId}:{qty},{variantId}:{qty}
      const cartItems = input.lines
        .map((l) => {
          // Extract numeric variant ID from gid://shopify/ProductVariant/123456
          const numericId = l.variantId.split("/").pop() ?? l.variantId;
          return `${numericId}:${l.quantity}`;
        })
        .join(",");
      const checkoutUrl = `https://${shop}/cart/${cartItems}`;
      return { checkoutUrl };
    }),
});
