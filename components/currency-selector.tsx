"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CURRENCY_DATA } from "@/utils/currency-data"

interface CurrencySelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
}

export function CurrencySelector({
  value,
  onValueChange,
  placeholder = "Select currency",
  label,
  disabled = false,
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCurrencies, setFilteredCurrencies] = useState(CURRENCY_DATA)
  const inputRef = useRef<HTMLInputElement>(null)

  // Popular currencies for quick selection
  const popularCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"]

  // Filter currencies based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCurrencies(CURRENCY_DATA)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = CURRENCY_DATA.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        currency.country.toLowerCase().includes(query) ||
        (currency.symbol && currency.symbol.toLowerCase().includes(query)),
    )
    setFilteredCurrencies(filtered)
  }, [searchQuery])

  // Get selected currency details
  const selectedCurrency = CURRENCY_DATA.find((c) => c.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCurrency ? (
            <div className="flex items-center gap-2">
              <span>{selectedCurrency.flag}</span>
              <span>{selectedCurrency.code}</span>
              <span className="text-muted-foreground truncate">({selectedCurrency.name})</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder="Search currencies..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex-1 border-0 outline-none focus:ring-0"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            {!searchQuery && (
              <CommandGroup heading="Popular Currencies">
                {popularCurrencies.map((code) => {
                  const currency = CURRENCY_DATA.find((c) => c.code === code)
                  if (!currency) return null

                  return (
                    <CommandItem
                      key={currency.code}
                      value={currency.code}
                      onSelect={() => {
                        onValueChange(currency.code)
                        setOpen(false)
                      }}
                      className="flex items-center gap-2"
                    >
                      <span>{currency.flag}</span>
                      <span>{currency.code}</span>
                      <span className="text-muted-foreground truncate">({currency.name})</span>
                      <span className="ml-auto">{currency.symbol}</span>
                      {value === currency.code && <Check className="ml-2 h-4 w-4" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
            <CommandGroup heading={searchQuery ? "Search Results" : "All Currencies"}>
              {filteredCurrencies.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={currency.code}
                  onSelect={() => {
                    onValueChange(currency.code)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <span>{currency.flag}</span>
                  <span>{currency.code}</span>
                  <span className="text-muted-foreground truncate">({currency.name})</span>
                  <span className="ml-auto">{currency.symbol}</span>
                  {value === currency.code && <Check className="ml-2 h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
