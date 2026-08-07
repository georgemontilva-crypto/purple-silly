import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { adminRouter } from "./routers/admin";
import { adminCatalogRouter } from "./routers/adminCatalog";
import { authRouter } from "./routers/auth";
import { catalogRouter } from "./routers/catalog";
import { homeReelsRouter } from "./routers/homeReels";
import { leadsRouter } from "./routers/leads";
import { promoPopupsRouter } from "./routers/promoPopups";
import { reviewsRouter } from "./routers/reviews";
import { wholesaleRouter } from "./routers/wholesale";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  adminCatalog: adminCatalogRouter,
  auth: authRouter,
  catalog: catalogRouter,
  homeReels: homeReelsRouter,
  leads: leadsRouter,
  promoPopups: promoPopupsRouter,
  reviews: reviewsRouter,
  wholesale: wholesaleRouter,
});

export type AppRouter = typeof appRouter;
