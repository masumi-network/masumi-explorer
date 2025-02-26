import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  creatorName: text("creator_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  transactionType: text("transaction_type").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;