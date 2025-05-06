import {
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  uuid,
  varchar,
  text,
  timestamp,
  doublePrecision,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import {
  createInsertSchema,
  CreateSelectSchema,
  createSelectSchema,
} from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const roleEnum = pgEnum("role", ["admin", "user"]);
export const itemStatusEnum = pgEnum("item_status", [
  "Available",
  "In Use",
  "Damaged",
  "Lost",
]);
export const auditActionEnum = pgEnum("action", ["create", "update", "delete"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: varchar({ length: 255 }).unique().notNull(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: roleEnum().notNull().default("user"),
});

export const locations = pgTable("locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  imageUrl: text("imageUrl"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Audit log table
export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tableName: varchar("table_name", { length: 255 }).notNull(),
  recordId: text("record_id").notNull(),
  action: auditActionEnum("action").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
  details: text("details"),
});
export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Item table (includes tables)
export const items = pgTable("item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  imageUrl: varchar("imageUrl"),
  supplier: varchar("supplier", { length: 255 }),
  price: doublePrecision("price"), // Optional price
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});
export const stock = pgTable("stock", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  inventoryItemId: text("itemId")
    .references(() => items.id, { onDelete: "cascade" })
    .notNull(),
  locationId: text("location_id")
    .references(() => locations.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull().default(0),
  status: itemStatusEnum("status").default("Available"),
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
export const stockHistory = pgTable("stock_history", {
  id: serial("id").primaryKey(),
  stockId: text("stock_id")
    .references(() => stock.id, { onDelete: "cascade" })
    .notNull(),
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  changeReason: varchar("change_reason", { length: 255 }),
  userId: text("user_id").references(() => users.id), // For future user authentication
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const categoriesRelations = relations(categories, ({ many }) => ({
  inventoryItems: many(items),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  stock: many(stock),
}));

export const inventoryItemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  stock: many(stock),
}));

export const stockRelations = relations(stock, ({ one, many }) => ({
  inventoryItem: one(items, {
    fields: [stock.inventoryItemId],
    references: [items.id],
  }),
  location: one(locations, {
    fields: [stock.locationId],
    references: [locations.id],
  }),
  history: many(stockHistory),
}));

export const stockHistoryRelations = relations(stockHistory, ({ one }) => ({
  stock: one(stock, {
    fields: [stockHistory.stockId],
    references: [stock.id],
  }),
  user: one(users, {
    fields: [stockHistory.userId],
    references: [users.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const ZUser = createInsertSchema(users).extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type TUser = z.infer<typeof ZUser>;

export const ZItem = createInsertSchema(items);
export type TItem = z.infer<typeof ZItem>;

export const ZSelectItem = createSelectSchema(items).extend({});
export type TSelectItem = z.infer<typeof ZSelectItem>;

export const ZCategory = createSelectSchema(categories).extend({
  itemCount: z.number(),
});
export type TCategory = z.infer<typeof ZCategory>;

export const ZLocation = createSelectSchema(locations).extend({
  itemCount: z.number(),
});
export type TLocation = z.infer<typeof ZLocation>;

export const ZStock = createSelectSchema(stock);
export type TStock = z.infer<typeof ZStock>;

export const ZStockItem = z.object({
  item: ZItem,
  stock: ZStock.array(),
  categories: ZCategory.nullish(),
});
export type TStockItem = z.infer<typeof ZStockItem>;
