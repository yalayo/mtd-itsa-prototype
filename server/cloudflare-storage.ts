import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte } from 'drizzle-orm';
import { IStorage } from './storage';
import {
  User, InsertUser,
  Currency, InsertCurrency,
  Category, InsertCategory,
  Transaction, InsertTransaction,
  TaxReport, InsertTaxReport,
  users, currencies, categories, transactions, taxReports
} from '../shared/schema';

// Factory function to create a CloudflareStorage instance
export function createCloudflareStorage(d1: D1Database): IStorage {
  return new CloudflareStorage(d1);
}

export class CloudflareStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).get();
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).get();
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning().get();
    return result;
  }

  // Currency management
  async getCurrencies(): Promise<Currency[]> {
    return this.db.select().from(currencies).all();
  }

  async getCurrency(code: string): Promise<Currency | undefined> {
    const result = await this.db.select().from(currencies).where(eq(currencies.code, code)).get();
    return result;
  }

  async updateCurrency(code: string, rate: number): Promise<Currency> {
    const updated = await this.db
      .update(currencies)
      .set({ rate })
      .where(eq(currencies.code, code))
      .returning()
      .get();
    return updated;
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const result = await this.db.insert(currencies).values(currency).returning().get();
    return result;
  }

  // Category management
  async getCategories(userId: number): Promise<Category[]> {
    return this.db.select().from(categories).where(eq(categories.userId, userId)).all();
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id)).get();
    return result;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning().get();
    return result;
  }

  // Transaction management
  async getTransactions(userId: number, filters?: {
    startDate?: Date,
    endDate?: Date,
    type?: string,
    currency?: string
  }): Promise<Transaction[]> {
    let query = this.db.select().from(transactions).where(eq(transactions.userId, userId));

    if (filters) {
      if (filters.startDate) {
        query = query.where(gte(transactions.date, filters.startDate.toISOString()));
      }
      if (filters.endDate) {
        query = query.where(lte(transactions.date, filters.endDate.toISOString()));
      }
      if (filters.type) {
        query = query.where(eq(transactions.type, filters.type));
      }
      if (filters.currency) {
        query = query.where(eq(transactions.currency, filters.currency));
      }
    }

    return query.all();
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await this.db.select().from(transactions).where(eq(transactions.id, id)).get();
    return result;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await this.db.insert(transactions).values(transaction).returning().get();
    return result;
  }

  // Tax reporting
  async getTaxReports(userId: number): Promise<TaxReport[]> {
    return this.db.select().from(taxReports).where(eq(taxReports.userId, userId)).all();
  }

  async getTaxReport(id: number): Promise<TaxReport | undefined> {
    const result = await this.db.select().from(taxReports).where(eq(taxReports.id, id)).get();
    return result;
  }

  async createTaxReport(report: InsertTaxReport): Promise<TaxReport> {
    const result = await this.db.insert(taxReports).values(report).returning().get();
    return result;
  }

  async updateTaxReport(id: number, status: string, hmrcReference?: string): Promise<TaxReport> {
    const updateData: Partial<TaxReport> = { status };
    if (hmrcReference) {
      updateData.hmrcReference = hmrcReference;
    }

    const updated = await this.db
      .update(taxReports)
      .set(updateData)
      .where(eq(taxReports.id, id))
      .returning()
      .get();
    
    return updated;
  }
}