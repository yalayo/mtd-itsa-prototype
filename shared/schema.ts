import { pgTable, text, serial, integer, decimal, varchar, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  businessType: text("business_type").notNull(), // "sole_trader" or "landlord"
  baseCurrency: text("base_currency").notNull().default("GBP"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  businessType: true,
  baseCurrency: true,
});

export const currencies = pgTable("currencies", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  rate: text("rate").notNull(), // Rate relative to GBP (stored as text)
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertCurrencySchema = createInsertSchema(currencies);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "income" or "expense"
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  type: true,
  userId: true,
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  convertedAmount: decimal("converted_amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "income" or "expense"
  categoryId: integer("category_id").references(() => categories.id),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  date: true,
  description: true,
  amount: true,
  currency: true,
  convertedAmount: true,
  type: true,
  categoryId: true,
  userId: true,
});

export const taxReports = pgTable("tax_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(), // 1, 2, 3, 4
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalIncome: decimal("total_income", { precision: 10, scale: 2 }).notNull(),
  totalExpenses: decimal("total_expenses", { precision: 10, scale: 2 }).notNull(),
  taxDue: decimal("tax_due", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "draft", "submitted", "confirmed"
  submissionDate: timestamp("submission_date"),
  hmrcReference: text("hmrc_reference"),
});

export const insertTaxReportSchema = createInsertSchema(taxReports).pick({
  userId: true,
  year: true,
  quarter: true,
  startDate: true,
  endDate: true,
  totalIncome: true,
  totalExpenses: true,
  taxDue: true,
  status: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type TaxReport = typeof taxReports.$inferSelect;
export type InsertTaxReport = z.infer<typeof insertTaxReportSchema>;
