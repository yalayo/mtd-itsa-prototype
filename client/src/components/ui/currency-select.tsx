import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrencies } from "@/lib/api";

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CurrencySelect({ value, onChange, className }: CurrencySelectProps) {
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string; symbol: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await getCurrencies();
        setCurrencies(data);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrencies();
  }, []);
  
  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading currencies..." />
        </SelectTrigger>
      </Select>
    );
  }
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Currencies</SelectItem>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
