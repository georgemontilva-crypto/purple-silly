import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow (email + password, sessions signed with
 * JWT_SECRET — see server/_core/auth.ts).
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// One-time email verification tokens (24h TTL) issued at signup. Verifying
// does NOT gate login — see server/routers/auth.ts — it just flips
// users.emailVerified.
export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

// Marketing leads (e.g. the mobile menu's "request a coupon" field).
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["new", "contacted", "converted", "unsubscribed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// Lab Report Categories
export const labReportCategories = mysqlTable("lab_report_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LabReportCategory = typeof labReportCategories.$inferSelect;
export type InsertLabReportCategory = typeof labReportCategories.$inferInsert;

// Lab Reports
export const labReports = mysqlTable("lab_reports", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  productName: varchar("productName", { length: 256 }),
  batchNumber: varchar("batchNumber", { length: 128 }),
  testDate: varchar("testDate", { length: 32 }),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileName: varchar("fileName", { length: 256 }).notNull(),
  isPublished: int("isPublished").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LabReport = typeof labReports.$inferSelect;
export type InsertLabReport = typeof labReports.$inferInsert;

// Site Assets (managed from Admin → Assets Manager, stored in Cloudflare R2)
export const siteAssets = mysqlTable("site_assets", {
  id: int("id").autoincrement().primaryKey(),
  section: varchar("section", { length: 128 }).notNull(),   // e.g. "hero", "choose-your-ride-dots"
  label: varchar("label", { length: 256 }).notNull(),        // human-readable name
  key: varchar("key", { length: 512 }).notNull().unique(),   // R2 object key
  url: varchar("url", { length: 1024 }).notNull(),           // public URL
  mimeType: varchar("mimeType", { length: 128 }),
  sizeBytes: int("sizeBytes"),
  width: int("width"),
  height: int("height"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteAsset = typeof siteAssets.$inferSelect;
export type InsertSiteAsset = typeof siteAssets.$inferInsert;

// ─── Catalog ──────────────────────────────────────────────────────────────
// No DB-level foreign keys, matching the existing labReports/labReportCategories
// convention in this file — relations are enforced at the app layer.

// Product Categories (separate from lab_report_categories above — do not conflate).
export const productCategories = mysqlTable("product_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  // Dedicated "Choose Your Ride" card image (Fase 3C) — separate from the
  // general imageKey/imageUrl pair above, which isn't consumed by any
  // storefront section today.
  cardImageKey: varchar("cardImageKey", { length: 512 }),
  cardImageUrl: varchar("cardImageUrl", { length: 1024 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  featured: boolean("featured").default(false).notNull(),
  categoryId: int("categoryId"),
  tags: json("tags").$type<string[]>().notNull(),
  seoTitle: varchar("seoTitle", { length: 256 }),
  seoDescription: varchar("seoDescription", { length: 512 }),
  // Product detail page accordions (Part 4) — plain text, not jsonb: MySQL's
  // JSON type adds no value here since each is rendered as one text block.
  ingredients: text("ingredients"),
  howToTake: text("howToTake"),
  disclaimer: text("disclaimer"),
  // "Secret Trick" section (Fase 3C) — entirely admin-managed per product;
  // ProductDetailPage renders nothing here unless secretTitle is set.
  secretTitle: varchar("secretTitle", { length: 256 }),
  secretSubtitle: varchar("secretSubtitle", { length: 512 }),
  secretImageKey: varchar("secretImageKey", { length: 512 }),
  secretImageUrl: varchar("secretImageUrl", { length: 1024 }),
  secretCards: json("secretCards").$type<{ title: string; description: string }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Variants: flavor/size options, each independently priced and stocked.
export const productVariants = mysqlTable("product_variants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  title: varchar("title", { length: 128 }).notNull(),
  sku: varchar("sku", { length: 128 }),
  priceCents: int("priceCents").notNull(),
  compareAtCents: int("compareAtCents"),
  stock: int("stock").default(0).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// Bundles: quantity-based pricing tiers (e.g. "3pk", "6pk"), independent of variants.
export const productBundles = mysqlTable("product_bundles", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  quantity: int("quantity").notNull(),
  priceCents: int("priceCents").notNull(),
  compareAtCents: int("compareAtCents"),
  badge: varchar("badge", { length: 64 }),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductBundle = typeof productBundles.$inferSelect;
export type InsertProductBundle = typeof productBundles.$inferInsert;

// Gallery images, ordered by `position`.
export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  r2Key: varchar("r2Key", { length: 512 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  alt: varchar("alt", { length: 256 }),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

// ─── Promo popups (Fase 5) ────────────────────────────────────────────────
//
// Discount popups shown on the storefront. At most ONE row may have
// active = true at a time; that's enforced in the router (activate/create/
// update all clear the flag on every other row) rather than by a
// constraint, because MySQL can't express "unique among the rows where
// active = true" — a plain unique index on `active` would instead cap the
// table at one inactive popup, which is the opposite of what's wanted.
//
// discountCode is stored here but deliberately NOT included in the public
// payload for anonymous visitors — see promoPopups.active in the router.
export const promoPopups = mysqlTable("promo_popups", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  subtitle: varchar("subtitle", { length: 512 }),
  bodyText: text("bodyText"),
  discountCode: varchar("discountCode", { length: 64 }).notNull(),
  buttonText: varchar("buttonText", { length: 128 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  active: boolean("active").default(false).notNull(),
  showDelaySeconds: int("showDelaySeconds").default(3).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromoPopup = typeof promoPopups.$inferSelect;
export type InsertPromoPopup = typeof promoPopups.$inferInsert;
