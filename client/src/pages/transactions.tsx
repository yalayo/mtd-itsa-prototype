import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, getCategories, createTransaction } from "@/lib/api";
import { useUser } from "@/context/user-context";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  ArrowDown, 
  ArrowUp, 
  Download, 
  Upload, 
  Plus, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

export default function Transactions() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(useSearch());
  const showNewTransactionModal = params.get("new") === "true";
  
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(showNewTransactionModal);
  
  // Form state for new transaction
  const [transactionDate, setTransactionDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [type, setType] = useState("income");
  const [categoryId, setCategoryId] = useState<number | string>("");
  
  useEffect(() => {
    setIsNewTransactionModalOpen(showNewTransactionModal);
  }, [showNewTransactionModal]);
  
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
  
  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [user?.id ? `/api/users/${user.id}/transactions` : null] });
      
      toast({
        title: "Transaction created",
        description: "Your transaction has been successfully added.",
      });
      
      // Reset form and close modal
      resetForm();
      closeNewTransactionModal();
    },
    onError: (error) => {
      toast({
        title: "Failed to create transaction",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
    setDescription("");
    setAmount("");
    setCurrency("GBP");
    setType("income");
    setCategoryId("");
  };
  
  const closeNewTransactionModal = () => {
    setIsNewTransactionModalOpen(false);
    // Update URL without the "new" parameter
    const newParams = new URLSearchParams(params);
    newParams.delete("new");
    setLocation(`/transactions${newParams.toString() ? `?${newParams.toString()}` : ""}`);
  };
  
  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate form
    if (!transactionDate || !description || !amount || !currency || !type || !categoryId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }
    
    // Find currency rate for conversion
    const selectedCurrencyObj = currencies?.find((c: any) => c.code === currency);
    const baseCurrencyObj = currencies?.find((c: any) => c.code === user.baseCurrency);
    
    if (!selectedCurrencyObj || !baseCurrencyObj) {
      toast({
        title: "Currency error",
        description: "Could not determine currency conversion rates.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate converted amount (to base currency)
    let convertedAmount = numericAmount;
    if (currency !== user.baseCurrency) {
      // Convert from selected currency to base currency
      convertedAmount = numericAmount / selectedCurrencyObj.rate * baseCurrencyObj.rate;
    }
    
    const newTransaction = {
      date: new Date(transactionDate),
      description,
      amount: numericAmount,
      currency,
      convertedAmount,
      type,
      categoryId: Number(categoryId),
      userId: user.id
    };
    
    createTransactionMutation.mutate(newTransaction);
  };
  
  if (isLoadingTransactions || isLoadingCategories || isLoadingCurrencies || !user) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your income and expenses</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!transactions || !categories || !currencies) {
    return null;
  }
  
  // Filter transactions
  let filteredTransactions = [...transactions];
  
  if (searchQuery) {
    filteredTransactions = filteredTransactions.filter(
      (t: any) => t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (selectedCurrency !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (t: any) => t.currency === selectedCurrency
    );
  }
  
  if (selectedType !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (t: any) => t.type === selectedType
    );
  }
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  
  const getCategory = (categoryId: number) => {
    return categories.find((c: any) => c.id === categoryId)?.name || "Uncategorized";
  };
  
  return (
    <>
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-lg font-semibold text-primary-500 md:ml-6">Transactions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Header and filters */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">All Transactions</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your income and expenses from all sources
              </p>
            </div>
            <Button onClick={() => setIsNewTransactionModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <CurrencySelect 
                value={selectedCurrency} 
                onChange={setSelectedCurrency}
              />
            </div>
          </div>
        </div>
        
        {/* Transactions table */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Converted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                          <div className={`h-8 w-8 rounded-full ${transaction.type === 'income' ? 'bg-primary-100 text-primary-500' : 'bg-red-100 text-red-500'} flex items-center justify-center mr-3`}>
                            {transaction.type === 'income' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                          </div>
                          {transaction.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {getCategory(transaction.categoryId)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(Number(transaction.amount), transaction.currency, currencies)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {transaction.currency !== user.baseCurrency && (
                            formatCurrency(Number(transaction.convertedAmount), user.baseCurrency, currencies)
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show 5 pages at most, centered around current page
                    const pageNum = Math.min(
                      Math.max(currentPage - 2 + i, 1),
                      totalPages
                    );
                    
                    // Skip if we already rendered this page number
                    if (i > 0 && pageNum <= Math.min(
                      Math.max(currentPage - 2 + i - 1, 1),
                      totalPages
                    )) {
                      return null;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* New Transaction Modal */}
      <Dialog open={isNewTransactionModalOpen} onOpenChange={closeNewTransactionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-date">Date</Label>
                <Input
                  id="transaction-date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transaction-type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="transaction-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-desc">Description</Label>
              <Input
                id="transaction-desc"
                placeholder="Enter description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-amount">Amount</Label>
                <Input
                  id="transaction-amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transaction-currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="transaction-currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency: any) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-category">Category</Label>
              <Select value={categoryId.toString()} onValueChange={(value) => setCategoryId(value)}>
                <SelectTrigger id="transaction-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((category: any) => category.type === type)
                    .map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={closeNewTransactionModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending ? "Saving..." : "Save Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
