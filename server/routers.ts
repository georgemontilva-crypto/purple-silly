import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { adminRouter } from "./routers/admin";
import { adminCatalogRouter } from "./routers/adminCatalog";
import { authRouter } from "./routers/auth";
import { catalogRouter } from "./routers/catalog";
import { leadsRouter } from "./routers/leads";
import { promoPopupsRouter } from "./routers/promoPopups";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  adminCatalog: adminCatalogRouter,
  auth: authRouter,
  catalog: catalogRouter,
  leads: leadsRouter,
  promoPopups: promoPopupsRouter,
});

export type AppRouter = typeof appRouter;
