import { desc } from "drizzle-orm";
import { z } from "zod";
import { leads } from "../../drizzle/schema";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { enforceRateLimit, getClientIp } from "../_core/rateLimit";
import { requireDb } from "../db";

export const leadsRouter = router({
  // Public — used by the mobile menu's "request a coupon" email field.
  create: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        source: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input, ctx }) => {
      enforceRateLimit(`lead:${getClientIp(ctx.req)}`, 5, 60 * 60 * 1000);
      const d = await requireDb();
      await d.insert(leads).values({ email: input.email.toLowerCase(), source: input.source });
      return { success: true } as const;
    }),

  list: adminProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const d = await requireDb();
      const rows = await d.select().from(leads).orderBy(desc(leads.createdAt));
      const search = input?.search?.trim().toLowerCase();
      if (!search) return rows;
      return rows.filter(l => l.email.toLowerCase().includes(search) || l.source.toLowerCase().includes(search));
    }),
});
