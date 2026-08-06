import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { adminRouter } from "./routers/admin";
import { adminCatalogRouter } from "./routers/adminCatalog";
import { authRouter } from "./routers/auth";
import { catalogRouter } from "./routers/catalog";
import { leadsRouter } from "./routers/leads";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  adminCatalog: adminCatalogRouter,
  auth: authRouter,
  catalog: catalogRouter,
  leads: leadsRouter,
});

export type AppRouter = typeof appRouter;
