import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
