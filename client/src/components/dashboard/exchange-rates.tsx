import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrencies, updateCurrencyRates } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ExchangeRates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { data: currencies, isLoading } = useQuery({
    queryKey: ["/api/currencies"],
  });
  
  const updateRatesMutation = useMutation({
    mutationFn: updateCurrencyRates,
    onSuccess: (updatedCurrencies) => {
      queryClient.setQueryData(["/api/currencies"], updatedCurrencies);
      setLastUpdated(new Date());
      toast({
        title: "Exchange rates updated",
        description: "Latest exchange rates have been fetched.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update exchange rates",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  useEffect(() => {
    if (currencies && currencies.length > 0) {
      // Find the most recent update time
      const mostRecent = currencies.reduce((latest: Date, currency: any) => {
        const currencyDate = new Date(currency.lastUpdated);
        return currencyDate > latest ? currencyDate : latest;
      }, new Date(0));
      
      setLastUpdated(mostRecent);
    }
  }, [currencies]);
  
  const handleUpdateRates = () => {
    updateRatesMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader className="px-4 py-5 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-gray-900">
            <div className="h-5 w-40 bg-gray-200 animate-pulse rounded"></div>
          </CardTitle>
          <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          </CardDescription>
        </CardHeader>
        <CardContent className="border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currencies) {
    return null;
  }
  
  // Filter out GBP as it's the base currency
  const exchangeRates = currencies.filter((c: any) => c.code !== "GBP");
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Current Exchange Rates</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">Base: GBP (£)</CardDescription>
      </CardHeader>
      <CardContent className="border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="space-y-2">
          {exchangeRates.map((currency: any) => (
            <div key={currency.code} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">{currency.code} ({currency.symbol})</span>
              </div>
              <div className="text-sm font-mono">{parseFloat(currency.rate).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-gray-50 sm:px-6 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Last updated: {lastUpdated ? lastUpdated.toLocaleString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          }) : 'Never'}
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleUpdateRates}
          disabled={updateRatesMutation.isPending}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Update
        </Button>
      </CardFooter>
    </Card>
  );
}
