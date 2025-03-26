import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./index";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { 
  insertUserSchema, 
  insertCategorySchema, 
  insertTransactionSchema,
  insertTaxReportSchema
} from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API error handler
  const handleApiError = (res: Response, error: unknown) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    
    return res.status(500).json({ message: "An unknown error occurred" });
  };

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  // Currency routes
  app.get("/api/currencies", async (_req, res) => {
    try {
      const currencies = await storage.getCurrencies();
      res.json(currencies);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  app.get("/api/currencies/:code", async (req, res) => {
    try {
      const code = req.params.code;
      const currency = await storage.getCurrency(code);
      
      if (!currency) {
        return res.status(404).json({ message: "Currency not found" });
      }
      
      res.json(currency);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  app.post("/api/currencies/update-rates", async (_req, res) => {
    try {
      // In a real app, you would call an external API for exchange rates
      // For demo purposes, we'll just update with mock data
      await storage.updateCurrency("EUR", 1.18);
      await storage.updateCurrency("USD", 1.31);
      await storage.updateCurrency("CAD", 1.78);
      await storage.updateCurrency("AUD", 1.92);
      
      const currencies = await storage.getCurrencies();
      res.json(currencies);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  // Category routes
  app.get("/api/users/:userId/categories", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  // Transaction routes
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const filters: any = {};
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.type) {
        filters.type = req.query.type as string;
      }
      
      if (req.query.currency) {
        filters.currency = req.query.currency as string;
      }
      
      const transactions = await storage.getTransactions(userId, filters);
      res.json(transactions);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  // Tax Report routes
  app.get("/api/users/:userId/tax-reports", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const taxReports = await storage.getTaxReports(userId);
      res.json(taxReports);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  app.post("/api/tax-reports", async (req, res) => {
    try {
      const reportData = insertTaxReportSchema.parse(req.body);
      const report = await storage.createTaxReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  app.put("/api/tax-reports/:id/submit", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getTaxReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Tax report not found" });
      }
      
      // In a real app, you would submit to HMRC API
      // For demo purposes, we'll just update the status
      const hmrcReference = `MTD-ITSA-${report.year}-Q${report.quarter}-${Math.floor(Math.random() * 1000000)}`;
      const updatedReport = await storage.updateTaxReport(id, "submitted", hmrcReference);
      
      res.json(updatedReport);
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  // Excel Import with Google Gemini AI
  app.post("/api/import/excel", async (req, res) => {
    try {
      // This would be handled by a file upload middleware in a real app
      // For demo purposes, we'll just simulate the process
      
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // In a real app, you would:
      // 1. Save the uploaded file
      // 2. Process it with Google Gemini AI
      // 3. Extract transactions
      // 4. Save them to the database
      
      res.json({ 
        message: "Import started successfully",
        status: "processing"
      });
    } catch (error) {
      handleApiError(res, error);
    }
  });
  
  // Mock HMRC API integration for MTD ITSA
  app.post("/api/hmrc/test-credentials", async (_req, res) => {
    try {
      // In a real app, you would validate HMRC API credentials
      res.json({ valid: true });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
