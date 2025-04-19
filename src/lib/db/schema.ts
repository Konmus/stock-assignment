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
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const roleEnum = pgEnum("role", ["admin", "user"]);
export const itemCategoryEnum = pgEnum("item_category", [
  "Book",
  "Stationery",
  "Equipment",
  "Table", // Changed from 'Furniture' to 'Table' for specificity
  "Other",
]);
export const itemStatusEnum = pgEnum("item_status", [
  "Available",
  "In Use",
  "Damaged",
  "Lost",
]);
export const auditActionEnum = pgEnum("action", ["create", "update", "delete"]);

export const stocksTable = pgTable("stocks", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
});

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

export const location = pgTable("location", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  place: varchar("place", { length: 255 }).notNull(), // e.g., "Room 520", "Courtyard"
  description: text("description"), // e.g., "Mounted on north wall"
  total: integer("total").notNull().default(0), // Number of items at this location
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  updatedBy: text("updated_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
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

// Item table (includes tables)
export const items = pgTable("item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  category: itemCategoryEnum("category").notNull().default("Other"),
  quantity: integer("quantity").notNull(),
  imageUrl: varchar("imageUrl"),
  price: decimal("price", { precision: 10, scale: 2 }), // Optional price
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
export const itemLocation = pgTable("item_location", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  locationId: text("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0), // Number of items allocated to this location
  assignedAt: timestamp("assigned_at", { mode: "date" }).notNull().defaultNow(),
});
export const stock = pgTable("stock", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  itemId: text("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  status: itemStatusEnum("status").notNull().default("Available"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  updatedBy: text("updated_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
});

export const stockRelations = relations(stock, ({ many, one }) => ({
  locations: many(location),
  item: one(items, {
    fields: [stock.itemId],
    references: [items.id],
  }),
  createdBy: one(users, {
    fields: [stock.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [stock.updatedBy],
    references: [users.id],
  }),
}));

export const locationRelations = relations(location, ({ many, one }) => ({
  stocks: many(location),
  createdBy: one(users, {
    fields: [location.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [location.updatedBy],
    references: [users.id],
  }),
}));

export const stockLocationRelations = relations(location, ({ one }) => ({
  stock: one(stock, {
    fields: [location.id],
    references: [stock.id],
  }),
  location: one(location, {
    fields: [location.id],
    references: [location.id],
  }),
  createdBy: one(users, {
    fields: [location.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [location.updatedBy],
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

export const ZUser = createInsertSchema(users);
export type TUser = z.infer<typeof ZUser>;

export const ZItem = createInsertSchema(items);
export type TItem = z.infer<typeof ZItem>;
