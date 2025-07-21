"use client"

// Shared utility for exchange rates across the application
import { useState, useEffect } from "react"

// Type definitions
export interface ExchangeRateData {
  rates: Record<string, number>
  lastUpdated: string
  refreshesRemaining: number
  nextRefreshAvailable: string | null
}

// Constants
const REFRESH_LIMIT = 2
const REFRESH_PERIOD_HOURS = 24
const STORAGE_KEY = "tripwiser-exchange-rates"

// Default exchange rate data
const DEFAULT_EXCHANGE_RATE_DATA: ExchangeRateData = {
  rates: {},
  lastUpdated: "",
  refreshesRemaining: REFRESH_LIMIT,
  nextRefreshAvailable: null,
}

// API endpoint for Currency Freaks
export const CURRENCY_API_URL = "https://api.currencyfreaks.com/latest?apikey=3918a5fd4fd34c1c8c85c3f9c51ec86e"

// Load exchange rate data from localStorage
export function loadExchangeRateData(): ExchangeRateData {
  if (typeof window === "undefined") return DEFAULT_EXCHANGE_RATE_DATA

  const storedData = localStorage.getItem(STORAGE_KEY)
  if (!storedData) return DEFAULT_EXCHANGE_RATE_DATA

  try {
    return JSON.parse(storedData)
  } catch (e) {
    console.error("Failed to parse stored exchange rate data", e)
    return DEFAULT_EXCHANGE_RATE_DATA
  }
}

// Save exchange rate data to localStorage
export function saveExchangeRateData(data: ExchangeRateData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Check if a refresh is allowed
export function canRefresh(data: ExchangeRateData): boolean {
  if (data.refreshesRemaining > 0) return true

  if (data.nextRefreshAvailable) {
    const nextRefresh = new Date(data.nextRefreshAvailable)
    const now = new Date()
    return now >= nextRefresh
  }

  return false
}

// Reset refresh count if the refresh period has passed
export function checkAndResetRefreshCount(data: ExchangeRateData): ExchangeRateData {
  if (!data.nextRefreshAvailable) return data

  const nextRefresh = new Date(data.nextRefreshAvailable)
  const now = new Date()

  if (now >= nextRefresh) {
    return {
      ...data,
      refreshesRemaining: REFRESH_LIMIT,
      nextRefreshAvailable: null,
    }
  }

  return data
}

// Update exchange rate data after a refresh
export function updateAfterRefresh(data: ExchangeRateData, newRates: Record<string, number>): ExchangeRateData {
  const now = new Date()
  const refreshesRemaining = data.refreshesRemaining - 1

  // Calculate when the next refresh will be available if this was the last one
  let nextRefreshAvailable = data.nextRefreshAvailable
  if (refreshesRemaining === 0) {
    const resetTime = new Date(now)
    resetTime.setHours(now.getHours() + REFRESH_PERIOD_HOURS)
    nextRefreshAvailable = resetTime.toISOString()
  }

  return {
    rates: newRates,
    lastUpdated: now.toISOString(),
    refreshesRemaining,
    nextRefreshAvailable,
  }
}

// Format time until next refresh
export function formatTimeUntilNextRefresh(nextRefreshAvailable: string | null): string {
  if (!nextRefreshAvailable) return ""

  const nextRefresh = new Date(nextRefreshAvailable)
  const now = new Date()
  const diffMs = nextRefresh.getTime() - now.getTime()

  if (diffMs <= 0) return "now"

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  } else {
    return `${diffMinutes}m`
  }
}

// Convert currency using the shared exchange rates
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return amount

  // If we don't have the rates, return the original amount
  if (!rates[fromCurrency] || !rates[toCurrency]) return amount

  // Convert through USD as the base currency
  return (amount / rates[fromCurrency]) * rates[toCurrency]
}

// Get exchange rate between two currencies
export function getExchangeRate(fromCurrency: string, toCurrency: string, rates: Record<string, number>): number {
  if (fromCurrency === toCurrency) return 1

  // Ensure both currencies exist in the rates and are not zero
  if (!rates[fromCurrency] || rates[fromCurrency] === 0 || !rates[toCurrency] || rates[toCurrency] === 0) {
    console.warn(
      `Missing or zero rate for ${fromCurrency} (${rates[fromCurrency]}) or ${toCurrency} (${rates[toCurrency]}). Cannot calculate exchange rate.`,
    )
    return 0 // Return 0 to indicate an invalid rate, which will be handled by the display logic
  }

  // Convert through USD as the base currency
  return rates[toCurrency] / rates[fromCurrency]
}

// Custom hook to use exchange rates across the application
export function useExchangeRates() {
  const [exchangeRateData, setExchangeRateData] = useState<ExchangeRateData>(DEFAULT_EXCHANGE_RATE_DATA)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Load exchange rate data on mount
  useEffect(() => {
    const data = loadExchangeRateData()
    const updatedData = checkAndResetRefreshCount(data)
    setExchangeRateData(updatedData)

    // If we have rates, we're not loading
    if (Object.keys(updatedData.rates).length > 0) {
      setIsLoading(false)
    } else {
      // If we don't have rates, fetch them
      fetchExchangeRates()
    }
  }, [])

  // Fetch exchange rates from the API
  const fetchExchangeRates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(CURRENCY_API_URL)
      console.log("Raw API response:", response)

      if (!response.ok) {
        // Attempt to read error message from response body if available
        const errorBody = await response.text()
        let errorMessage = `API request failed with status ${response.status}`
        try {
          const errorJson = JSON.parse(errorBody)
          if (errorJson.message) {
            errorMessage += `: ${errorJson.message}`
          } else if (errorJson.error) {
            errorMessage += `: ${errorJson.error}`
          }
        } catch (parseError) {
          // If body is not JSON, use plain text
          if (errorBody) errorMessage += `: ${errorBody.substring(0, 100)}...` // Truncate long messages
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Fetched exchange rates data:", data)
      console.log("Parsed rates object:", data.rates)

      if (!data.rates || Object.keys(data.rates).length === 0) {
        throw new Error("No exchange rates received from API. Please check your API key or try again later.")
      }

      // Update exchange rate data
      const updatedData = updateAfterRefresh(exchangeRateData, data.rates)
      setExchangeRateData(updatedData)
      saveExchangeRateData(updatedData)
    } catch (err: any) {
      // Use 'any' for error type to access message property
      console.error("Error fetching exchange rates:", err)
      setError(err.message || "Failed to fetch exchange rates. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh exchange rates if allowed
  const refreshExchangeRates = () => {
    const updatedData = checkAndResetRefreshCount(exchangeRateData)

    if (canRefresh(updatedData)) {
      fetchExchangeRates()
    } else {
      setError(
        `Refresh limit reached. Next refresh available in ${formatTimeUntilNextRefresh(updatedData.nextRefreshAvailable)}`,
      )
    }
  }

  return {
    rates: exchangeRateData.rates,
    lastUpdated: exchangeRateData.lastUpdated ? new Date(exchangeRateData.lastUpdated) : null,
    refreshesRemaining: exchangeRateData.refreshesRemaining,
    nextRefreshAvailable: exchangeRateData.nextRefreshAvailable
      ? new Date(exchangeRateData.nextRefreshAvailable)
      : null,
    isLoading,
    error,
    refreshExchangeRates,
    canRefresh: canRefresh(exchangeRateData),
    formatTimeUntilNextRefresh: () => formatTimeUntilNextRefresh(exchangeRateData.nextRefreshAvailable),
    convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) =>
      convertCurrency(amount, fromCurrency, toCurrency, exchangeRateData.rates),
  }
}
