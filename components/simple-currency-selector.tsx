"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CURRENCY_DATA } from "@/utils/currency-data"

interface SimpleCurrencySelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SimpleCurrencySelector({
  value,
  onValueChange,
  placeholder = "Select currency",
  className,
  disabled = false,
}: SimpleCurrencySelectorProps) {
  // Popular currencies for quick selection at the top
  const popularCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"]

  // Get popular currency data
  const popularCurrencyData = CURRENCY_DATA.filter((currency) => popularCurrencies.includes(currency.code)).sort(
    (a, b) => popularCurrencies.indexOf(a.code) - popularCurrencies.indexOf(b.code),
  )

  // Get remaining currencies
  const otherCurrencyData = CURRENCY_DATA.filter((currency) => !popularCurrencies.includes(currency.code)).sort(
    (a, b) => a.code.localeCompare(b.code),
  )

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value && CURRENCY_DATA.find((c) => c.code === value) && (
            <div className="flex items-center gap-2">
              <span>{CURRENCY_DATA.find((c) => c.code === value)?.flag}</span>
              <span>{value}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="max-h-[300px] overflow-y-auto">
          {popularCurrencyData.length > 0 && (
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Popular Currencies</div>
          )}
          {popularCurrencyData.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span>{currency.flag}</span>
                <span>{currency.code}</span>
                <span className="text-muted-foreground text-xs">({currency.name})</span>
              </div>
            </SelectItem>
          ))}

          {otherCurrencyData.length > 0 && (
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground mt-1">All Currencies</div>
          )}
          {otherCurrencyData.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span>{currency.flag}</span>
                <span>{currency.code}</span>
                <span className="text-muted-foreground text-xs truncate">({currency.name})</span>
              </div>
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  )
}
