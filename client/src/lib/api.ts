import { apiRequest } from "./queryClient";
import { Transaction, Category, Currency, TaxReport } from "@shared/schema";

// User API
export async function getCurrentUser() {
  const res = await apiRequest("GET", "/api/users/1", undefined);
  return res.json();
}

// Transaction API
export async function getTransactions(userId: number, filters?: {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  currency?: string;
}) {
  let url = `/api/users/${userId}/transactions`;
  
  if (filters) {
    const params = new URLSearchParams();
    
    if (filters.startDate) {
      params.append("startDate", filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      params.append("endDate", filters.endDate.toISOString());
    }
    
    if (filters.type) {
      params.append("type", filters.type);
    }
    
    if (filters.currency) {
      params.append("currency", filters.currency);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const res = await apiRequest("GET", url, undefined);
  return res.json() as Promise<Transaction[]>;
}

export async function createTransaction(transaction: Omit<Transaction, "id">) {
  const res = await apiRequest("POST", "/api/transactions", transaction);
  return res.json() as Promise<Transaction>;
}

// Category API
export async function getCategories(userId: number) {
  const res = await apiRequest("GET", `/api/users/${userId}/categories`, undefined);
  return res.json() as Promise<Category[]>;
}

export async function createCategory(category: Omit<Category, "id">) {
  const res = await apiRequest("POST", "/api/categories", category);
  return res.json() as Promise<Category>;
}

// Currency API
export async function getCurrencies() {
  const res = await apiRequest("GET", "/api/currencies", undefined);
  return res.json() as Promise<Currency[]>;
}

export async function updateCurrencyRates() {
  const res = await apiRequest("POST", "/api/currencies/update-rates", undefined);
  return res.json() as Promise<Currency[]>;
}

// Tax Report API
export async function getTaxReports(userId: number) {
  const res = await apiRequest("GET", `/api/users/${userId}/tax-reports`, undefined);
  return res.json() as Promise<TaxReport[]>;
}

export async function createTaxReport(report: Omit<TaxReport, "id" | "submissionDate" | "hmrcReference">) {
  const res = await apiRequest("POST", "/api/tax-reports", report);
  return res.json() as Promise<TaxReport>;
}

export async function submitTaxReport(reportId: number) {
  const res = await apiRequest("PUT", `/api/tax-reports/${reportId}/submit`, undefined);
  return res.json() as Promise<TaxReport>;
}

// Excel Import API
export async function importExcelFile(userId: number, file: File) {
  // In a real app, this would upload the file
  // For demo purposes, we'll just simulate the process
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId.toString());
  
  const res = await apiRequest("POST", "/api/import/excel", { userId });
  return res.json();
}

// HMRC API
export async function testHMRCCredentials() {
  const res = await apiRequest("POST", "/api/hmrc/test-credentials", undefined);
  return res.json();
}
