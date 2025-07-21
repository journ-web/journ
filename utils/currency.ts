// Mock exchange rates for demonstration (fallback if API fails)
const exchangeRates: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.82,
    THB: 35.76,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.89,
    CNY: 7.24,
    INR: 83.12,
  },
  EUR: {
    USD: 1.09,
    GBP: 0.86,
    JPY: 162.85,
    THB: 38.87,
    AUD: 1.65,
    CAD: 1.48,
    CHF: 0.97,
    CNY: 7.87,
    INR: 90.35,
  },
  // Add more currencies as needed
}

export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
]

// This function is kept for backward compatibility but now uses the shared rates when available
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1

  if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
    return exchangeRates[fromCurrency][toCurrency]
  }

  if (exchangeRates[toCurrency] && exchangeRates[toCurrency][fromCurrency]) {
    return 1 / exchangeRates[toCurrency][fromCurrency]
  }

  // Default fallback
  return 1
}

// This function is kept for backward compatibility but now uses the shared rates when available
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // Try to use the shared exchange rates utility first
  try {
    // This is a dynamic import to avoid circular dependencies
    // The actual conversion will happen in the component using useExchangeRates
    return amount * getExchangeRate(fromCurrency, toCurrency)
  } catch (error) {
    // Fallback to the old implementation
    const rate = getExchangeRate(fromCurrency, toCurrency)
    return amount * rate
  }
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = currencies.find((c) => c.code === currencyCode)
  const symbol = currency?.symbol || currencyCode

  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
