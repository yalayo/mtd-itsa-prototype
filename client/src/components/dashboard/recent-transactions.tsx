import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactions, getCategories } from "@/lib/api";
import { useUser } from "@/context/user-context";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CurrencySelect } from "@/components/ui/currency-select";
import { ArrowDown, ArrowUp, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function RecentTransactions() {
  const { user } = useUser();
  const [selectedCurrency, setSelectedCurrency] = useState("all");
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [user?.id ? `/api/users/${user.id}/transactions` : null],
    enabled: !!user?.id,
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: [user?.id ? `/api/users/${user.id}/categories` : null],
    enabled: !!user?.id,
  });
  
  const { data: currencies, isLoading: isLoadingCurrencies } = useQuery({
    queryKey: ["/api/currencies"],
  });
  
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  };
  
  if (isLoadingTransactions || isLoadingCategories || isLoadingCurrencies || !user) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <CardTitle className="text-lg font-medium leading-6 text-gray-900">Recent Transactions</CardTitle>
          <div className="w-40 h-10 bg-gray-200 animate-pulse rounded" />
        </CardHeader>
        <div className="border-t border-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-4 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
                  <div className="ml-4">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                    <div className="mt-1 h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (!transactions || !categories || !currencies) {
    return null;
  }
  
  const filteredTransactions = selectedCurrency === "all" 
    ? transactions 
    : transactions.filter((t: any) => t.currency === selectedCurrency);
  
  const getCategory = (categoryId: number) => {
    return categories.find((c: any) => c.id === categoryId)?.name || "Uncategorized";
  };
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Recent Transactions</CardTitle>
        <div className="relative">
          <CurrencySelect 
            value={selectedCurrency} 
            onChange={handleCurrencyChange}
            className="w-40"
          />
        </div>
      </CardHeader>
      <div className="border-t border-gray-200 divide-y divide-gray-200">
        {filteredTransactions.slice(0, 5).map((transaction: any) => (
          <div key={transaction.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full ${transaction.type === 'income' ? 'bg-primary-100 text-primary-500' : 'bg-red-100 text-red-500'} flex items-center justify-center`}>
                    {transaction.type === 'income' ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount), transaction.currency, currencies)}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.currency !== user.baseCurrency && (
                    `~${formatCurrency(Number(transaction.convertedAmount), user.baseCurrency, currencies)}`
                  )}
                  {" (Category: "}{getCategory(transaction.categoryId)}{")"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CardFooter className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <Link href="/transactions">
          <a className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-end">
            View all transactions <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
