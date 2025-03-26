import { Currency } from "@shared/schema";

export function formatCurrency(amount: number, currency: string, currencies: Currency[]) {
  const currencyInfo = currencies.find(c => c.code === currency);
  
  if (!currencyInfo) {
    return `${currency} ${amount.toFixed(2)}`;
  }
  
  return `${currencyInfo.symbol}${amount.toFixed(2)}`;
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, currencies: Currency[]) {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate;
  const toRate = currencies.find(c => c.code === toCurrency)?.rate;
  
  if (!fromRate || !toRate) {
    throw new Error(`Currency conversion rate not available for ${fromCurrency} to ${toCurrency}`);
  }
  
  // Convert to base currency (GBP) and then to target currency
  const amountInGBP = amount / fromRate;
  return amountInGBP * toRate;
}

export function getFormattedConvertedAmount(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  currencies: Currency[]
) {
  const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency, currencies);
  return formatCurrency(convertedAmount, toCurrency, currencies);
}
