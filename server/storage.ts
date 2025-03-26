import { 
  users, User, InsertUser, 
  currencies, Currency, InsertCurrency, 
  categories, Category, InsertCategory, 
  transactions, Transaction, InsertTransaction,
  taxReports, TaxReport, InsertTaxReport
} from "../shared/schema.js";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Currency management
  getCurrencies(): Promise<Currency[]>;
  getCurrency(code: string): Promise<Currency | undefined>;
  updateCurrency(code: string, rate: number): Promise<Currency>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  
  // Category management
  getCategories(userId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Transaction management
  getTransactions(userId: number, filters?: { 
    startDate?: Date, 
    endDate?: Date, 
    type?: string, 
    currency?: string 
  }): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Tax reporting
  getTaxReports(userId: number): Promise<TaxReport[]>;
  getTaxReport(id: number): Promise<TaxReport | undefined>;
  createTaxReport(report: InsertTaxReport): Promise<TaxReport>;
  updateTaxReport(id: number, status: string, hmrcReference?: string): Promise<TaxReport>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currencies: Map<string, Currency>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private taxReports: Map<number, TaxReport>;
  
  private userId: number = 1;
  private categoryId: number = 1;
  private transactionId: number = 1;
  private taxReportId: number = 1;

  constructor() {
    this.users = new Map();
    this.currencies = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.taxReports = new Map();
    
    // Initial currencies
    this.currencies.set("GBP", {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      rate: "1.0",
      lastUpdated: new Date()
    });
    
    this.currencies.set("EUR", {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      rate: 1.18,
      lastUpdated: new Date()
    });
    
    this.currencies.set("USD", {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      rate: 1.31,
      lastUpdated: new Date()
    });
    
    this.currencies.set("CAD", {
      code: "CAD",
      name: "Canadian Dollar",
      symbol: "$",
      rate: 1.78,
      lastUpdated: new Date()
    });
    
    this.currencies.set("AUD", {
      code: "AUD",
      name: "Australian Dollar",
      symbol: "$",
      rate: 1.92,
      lastUpdated: new Date()
    });
    
    // Sample user
    const sampleUser: User = {
      id: this.userId++,
      username: "john.smith",
      password: "password123", // In a real app, this would be hashed
      fullName: "John Smith",
      businessType: "sole_trader",
      baseCurrency: "GBP"
    };
    this.users.set(sampleUser.id, sampleUser);
    
    // Sample categories
    const sampleCategories: InsertCategory[] = [
      { name: "Sales", type: "income", userId: 1 },
      { name: "Property Income", type: "income", userId: 1 },
      { name: "Office Expenses", type: "expense", userId: 1 },
      { name: "Subscriptions", type: "expense", userId: 1 }
    ];
    
    sampleCategories.forEach(cat => {
      const category: Category = { ...cat, id: this.categoryId++ };
      this.categories.set(category.id, category);
    });
    
    // Sample transactions
    const now = new Date();
    const sampleTransactions: InsertTransaction[] = [
      { 
        date: new Date(now.getFullYear(), now.getMonth(), 12), 
        description: "Client Payment - Website Development", 
        amount: 1200, 
        currency: "GBP", 
        convertedAmount: 1200, 
        type: "income", 
        categoryId: 1, 
        userId: 1 
      },
      { 
        date: new Date(now.getFullYear(), now.getMonth(), 8), 
        description: "Consulting Service", 
        amount: 850, 
        currency: "EUR", 
        convertedAmount: 720.45, 
        type: "income", 
        categoryId: 1, 
        userId: 1 
      },
      { 
        date: new Date(now.getFullYear(), now.getMonth(), 5), 
        description: "Office Supplies", 
        amount: 142.50, 
        currency: "GBP", 
        convertedAmount: 142.50, 
        type: "expense", 
        categoryId: 3, 
        userId: 1 
      },
      { 
        date: new Date(now.getFullYear(), now.getMonth(), 1), 
        description: "Software Subscription", 
        amount: 49.99, 
        currency: "USD", 
        convertedAmount: 38.25, 
        type: "expense", 
        categoryId: 4, 
        userId: 1 
      },
      { 
        date: new Date(now.getFullYear(), now.getMonth() - 1, 28), 
        description: "Rental Income", 
        amount: 975, 
        currency: "GBP", 
        convertedAmount: 975, 
        type: "income", 
        categoryId: 2, 
        userId: 1 
      }
    ];
    
    sampleTransactions.forEach(trans => {
      const transaction: Transaction = { ...trans, id: this.transactionId++ };
      this.transactions.set(transaction.id, transaction);
    });
    
    // Sample tax reports
    const sampleTaxReports: InsertTaxReport[] = [
      {
        userId: 1,
        year: 2023,
        quarter: 4,
        startDate: new Date(2023, 9, 1), // Oct 1, 2023
        endDate: new Date(2023, 11, 31), // Dec 31, 2023
        totalIncome: 15000,
        totalExpenses: 4200,
        taxDue: 2160,
        status: "submitted",
      }
    ];
    
    sampleTaxReports.forEach(report => {
      const taxReport: TaxReport = { 
        ...report, 
        id: this.taxReportId++,
        submissionDate: new Date(2024, 0, 31), // Jan 31, 2024
        hmrcReference: "MTD-ITSA-2023-Q4-123456"
      };
      this.taxReports.set(taxReport.id, taxReport);
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Currency management
  async getCurrencies(): Promise<Currency[]> {
    return Array.from(this.currencies.values());
  }
  
  async getCurrency(code: string): Promise<Currency | undefined> {
    return this.currencies.get(code);
  }
  
  async updateCurrency(code: string, rate: number): Promise<Currency> {
    const currency = this.currencies.get(code);
    if (!currency) {
      throw new Error(`Currency ${code} not found`);
    }
    
    const updated: Currency = {
      ...currency,
      rate,
      lastUpdated: new Date()
    };
    
    this.currencies.set(code, updated);
    return updated;
  }
  
  async createCurrency(insertCurrency: InsertCurrency): Promise<Currency> {
    const code = insertCurrency.code;
    if (this.currencies.has(code)) {
      throw new Error(`Currency ${code} already exists`);
    }
    
    const currency: Currency = {
      ...insertCurrency,
      lastUpdated: new Date()
    };
    
    this.currencies.set(code, currency);
    return currency;
  }
  
  // Category management
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId
    );
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Transaction management
  async getTransactions(userId: number, filters?: { 
    startDate?: Date, 
    endDate?: Date, 
    type?: string, 
    currency?: string 
  }): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
    
    if (filters) {
      if (filters.startDate) {
        transactions = transactions.filter(t => 
          t.date >= filters.startDate!
        );
      }
      
      if (filters.endDate) {
        transactions = transactions.filter(t => 
          t.date <= filters.endDate!
        );
      }
      
      if (filters.type) {
        transactions = transactions.filter(t => 
          t.type === filters.type
        );
      }
      
      if (filters.currency) {
        transactions = transactions.filter(t => 
          t.currency === filters.currency
        );
      }
    }
    
    // Sort by date descending (newest first)
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Tax reporting
  async getTaxReports(userId: number): Promise<TaxReport[]> {
    return Array.from(this.taxReports.values())
      .filter((report) => report.userId === userId)
      .sort((a, b) => {
        // Sort by year and quarter, most recent first
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return b.quarter - a.quarter;
      });
  }
  
  async getTaxReport(id: number): Promise<TaxReport | undefined> {
    return this.taxReports.get(id);
  }
  
  async createTaxReport(insertReport: InsertTaxReport): Promise<TaxReport> {
    const id = this.taxReportId++;
    const report: TaxReport = { 
      ...insertReport, 
      id,
      submissionDate: undefined,
      hmrcReference: undefined
    };
    this.taxReports.set(id, report);
    return report;
  }
  
  async updateTaxReport(id: number, status: string, hmrcReference?: string): Promise<TaxReport> {
    const report = this.taxReports.get(id);
    if (!report) {
      throw new Error(`Tax report ${id} not found`);
    }
    
    const updated: TaxReport = {
      ...report,
      status,
      submissionDate: status === "submitted" ? new Date() : report.submissionDate,
      hmrcReference: hmrcReference || report.hmrcReference
    };
    
    this.taxReports.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
