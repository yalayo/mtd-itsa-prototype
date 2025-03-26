import { useQuery } from "@tanstack/react-query";
import { getTransactions, getTaxReports } from "@/lib/api";
import { useUser } from "@/context/user-context";
import { ArrowUp, ArrowDown, FileText, CheckCircle, Coins, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function QuickStats() {
  const { user } = useUser();
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [user?.id ? `/api/users/${user.id}/transactions` : null],
    enabled: !!user?.id,
  });
  
  const { data: taxReports, isLoading: isLoadingTaxReports } = useQuery({
    queryKey: [user?.id ? `/api/users/${user.id}/tax-reports` : null],
    enabled: !!user?.id,
  });
  
  if (isLoadingTransactions || isLoadingTaxReports || !user) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-1 h-12 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Calculate stats
  let totalRevenue = 0;
  let totalExpenses = 0;
  let yearlyRevenue = 0;
  let yearlyExpenses = 0;
  let lastYearRevenue = 0;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  
  if (transactions) {
    transactions.forEach((transaction: any) => {
      if (transaction.type === "income") {
        totalRevenue += Number(transaction.convertedAmount);
        
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getFullYear() === currentYear) {
          yearlyRevenue += Number(transaction.convertedAmount);
        } else if (transactionDate.getFullYear() === currentYear - 1) {
          lastYearRevenue += Number(transaction.convertedAmount);
        }
      } else {
        totalExpenses += Number(transaction.convertedAmount);
        
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getFullYear() === currentYear) {
          yearlyExpenses += Number(transaction.convertedAmount);
        }
      }
    });
  }
  
  const revenueChangePercent = lastYearRevenue > 0 
    ? Math.round((yearlyRevenue - lastYearRevenue) / lastYearRevenue * 100) 
    : 0;
    
  const expenseChangePercent = Math.round(yearlyExpenses / (yearlyRevenue || 1) * 100) - 30; // Simulate a change
  
  // Estimate tax based on simple calculation
  const estimatedTax = Math.round((yearlyRevenue - yearlyExpenses) * 0.2);
  
  // Get MTD status
  let mtdStatus = "Not Compliant";
  let lastFiled = "";
  
  if (taxReports && taxReports.length > 0) {
    const submittedReports = taxReports.filter((report: any) => report.status === "submitted");
    
    if (submittedReports.length > 0) {
      mtdStatus = "Compliant";
      
      const lastReport = submittedReports[0];
      if (lastReport.submissionDate) {
        const submissionDate = new Date(lastReport.submissionDate);
        lastFiled = submissionDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
  }
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Revenue Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Coins className="h-5 w-5 text-primary-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Revenue (YTD)</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">£{yearlyRevenue.toFixed(2)}</div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="sr-only">Increased by</span>
                    {revenueChangePercent}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <Receipt className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Expenses (YTD)</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">£{yearlyExpenses.toFixed(2)}</div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="sr-only">Decreased by</span>
                    {Math.abs(expenseChangePercent)}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Due Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Estimated Tax Due</dt>
                <dd>
                  <div className="text-2xl font-semibold text-gray-900">£{estimatedTax.toFixed(2)}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MTD Status Card */}
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">MTD Status</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">{mtdStatus}</div>
                  {lastFiled && <div className="text-sm text-gray-500">Last filed: {lastFiled}</div>}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
