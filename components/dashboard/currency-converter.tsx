"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowRight, RefreshCw, TrendingUp, AlertCircle, Info, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useExchangeRates } from "@/utils/exchange-rates"
import { CurrencySelector } from "@/components/currency-selector"
import { CURRENCY_DATA, getCurrencyByCode } from "@/utils/currency-data"

export function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(100)
  const [fromCurrency, setFromCurrency] = useState<string>("USD")
  const [toCurrencies, setToCurrencies] = useState<string[]>(["EUR", "GBP", "JPY"])
  const [activeTab, setActiveTab] = useState<string>("charts")
  const [historicalData, setHistoricalData] = useState<any>({})
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

  // Use the shared exchange rates hook
  const {
    rates: exchangeRates,
    lastUpdated,
    refreshesRemaining,
    nextRefreshAvailable,
    isLoading,
    error,
    refreshExchangeRates,
    canRefresh,
    formatTimeUntilNextRefresh,
    convertCurrency,
  } = useExchangeRates()

  // Set available currencies when exchange rates change
  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      setAvailableCurrencies(Object.keys(exchangeRates))
    }
  }, [exchangeRates])

  // Generate historical data when exchange rates or selected currencies change
  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      const newHistoricalData: any = {}
      toCurrencies.forEach((currency) => {
        if (exchangeRates[currency]) {
          newHistoricalData[currency] = generateHistoricalData(currency, exchangeRates)
        }
      })
      setHistoricalData(newHistoricalData)
    }
  }, [exchangeRates, toCurrencies])

  // Handle manual refresh
  const handleRefresh = () => {
    refreshExchangeRates()
  }

  // Generate historical data based on current rates
  const generateHistoricalData = (currency: string, rates: Record<string, number>) => {
    const baseRate = rates[currency] || 1
    const data = []
    const today = new Date()

    // Base volatility on currency type (some currencies fluctuate more than others)
    const volatilityFactor = ["JPY", "INR", "THB"].includes(currency)
      ? 0.08
      : ["GBP", "EUR", "CHF"].includes(currency)
        ? 0.04
        : 0.06

    let previousRate = baseRate

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`

      // Create a more realistic trend with some randomness but also continuity
      const dailyChange = (Math.random() - 0.5) * volatilityFactor
      const newRate = previousRate * (1 + dailyChange)
      previousRate = newRate

      data.push({
        date: formattedDate,
        rate: Number.parseFloat(newRate.toFixed(4)),
      })
    }

    return data
  }

  const handleCurrencyChange = (index: number, value: string) => {
    const newToCurrencies = [...toCurrencies]
    newToCurrencies[index] = value
    setToCurrencies(newToCurrencies)

    // Generate historical data for the new currency
    if (exchangeRates[value]) {
      setHistoricalData((prev) => ({
        ...prev,
        [value]: generateHistoricalData(value, exchangeRates),
      }))
    }
  }

  // Convert currency using the shared utility
  const convertCurrencyDisplay = (to: string) => {
    if (Object.keys(exchangeRates).length === 0 || !exchangeRates[fromCurrency] || !exchangeRates[to]) {
      return "Loading..."
    }

    return convertCurrency(amount, fromCurrency, to).toFixed(2)
  }

  // Format the last updated time
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return "Never"
    return lastUpdated.toLocaleTimeString()
  }, [lastUpdated])

  // Pagination logic for rate table
  const availableCurrencyData = CURRENCY_DATA.filter((currency) => availableCurrencies.includes(currency.code))
  const totalPages = Math.ceil(availableCurrencyData.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCurrencies = availableCurrencyData.slice(startIndex, endIndex)

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Currency Converter</h1>
          <p className="text-muted-foreground">Convert between currencies with real-time exchange rates</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {formattedLastUpdated}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || !canRefresh}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Rates
            </Button>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {refreshesRemaining} refresh{refreshesRemaining !== 1 ? "es" : ""} remaining today
              {nextRefreshAvailable && refreshesRemaining === 0 && ` (next in ${formatTimeUntilNextRefresh()})`}
            </span>
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Exchange rates are updated in real-time from Currency Freaks. You can refresh rates up to 2 times per day. The
          refresh rates will be used in expense tracker and splitly to carry our real-time tracking of your expenses.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>Convert Currency</CardTitle>
          <CardDescription>Enter an amount and select currencies to convert between</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-6">
          <div className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                  min={0}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="from-currency">From Currency</Label>
                <CurrencySelector value={fromCurrency} onValueChange={setFromCurrency} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <div className="flex items-center justify-center bg-white dark:bg-gray-800 p-2 rounded-full border">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {toCurrencies.map((currency, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <Label htmlFor={`to-currency-${index}`}>To Currency {index + 1}</Label>
                    <CurrencySelector value={currency} onValueChange={(value) => handleCurrencyChange(index, value)} />
                  </div>
                  <div>
                    <div className="relative">
                      <Input
                        value={isLoading ? "Loading..." : convertCurrencyDisplay(currency)}
                        readOnly
                        className="bg-muted font-medium text-right pr-10"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-muted-foreground">{getCurrencyByCode(currency)?.symbol || currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 px-6 py-4 flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
                  <Info className="h-4 w-4" />
                  <span>Base currency: USD</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>All conversions use USD as the base currency</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge variant="outline" className="ml-auto">
            Powered by Currency Freaks
          </Badge>
        </CardFooter>
      </Card>

      <Tabs defaultValue="charts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="transition-all">
            Exchange Rate Charts
          </TabsTrigger>
          <TabsTrigger value="table" className="transition-all">
            Rate Table
          </TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="space-y-4">
          {toCurrencies.map((currency, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center">
                  <div className="flex items-center gap-2">
                    <span>{getCurrencyByCode(fromCurrency)?.flag || ""}</span>
                    <span>{fromCurrency}</span>
                    <ArrowRight className="h-4 w-4 mx-2" />
                    <span>{getCurrencyByCode(currency)?.flag || ""}</span>
                    <span>{currency}</span>
                    <span className="text-sm font-normal text-muted-foreground ml-2">30 Day Trend</span>
                  </div>
                  <TrendingUp className="ml-auto h-5 w-5 text-green-500" />
                </CardTitle>
                <CardDescription>Historical exchange rate data for the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] p-4">
                  {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : historicalData[currency] ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData[currency]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={["auto", "auto"]} />
                        <RechartsTooltip
                          formatter={(value: number) => [`${value.toFixed(4)} ${currency}`, "Rate"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#f472b6"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <p className="text-muted-foreground">No data available for {currency}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 px-6 py-4">
                <p className="text-sm font-medium">
                  Current rate: 1 {fromCurrency} ={" "}
                  {isLoading
                    ? "Loading..."
                    : exchangeRates[currency] && exchangeRates[fromCurrency]
                      ? (exchangeRates[currency] / exchangeRates[fromCurrency]).toFixed(4)
                      : "N/A"}{" "}
                  {currency} {getCurrencyByCode(currency)?.symbol || ""}
                </p>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="table">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle>Exchange Rate Table</CardTitle>
              <CardDescription>Current exchange rates for popular currencies</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Currency</th>
                      <th className="p-3 text-left font-medium">Code</th>
                      <th className="p-3 text-right font-medium">Rate (1 {fromCurrency})</th>
                      <th className="p-3 text-right font-medium">Inverse Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading
                      ? Array(itemsPerPage)
                          .fill(0)
                          .map((_, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-3">
                                <Skeleton className="h-6 w-32" />
                              </td>
                              <td className="p-3">
                                <Skeleton className="h-6 w-16" />
                              </td>
                              <td className="p-3 text-right">
                                <Skeleton className="h-6 w-24 ml-auto" />
                              </td>
                              <td className="p-3 text-right">
                                <Skeleton className="h-6 w-32 ml-auto" />
                              </td>
                            </tr>
                          ))
                      : paginatedCurrencies.map((currency) => {
                          if (
                            Object.keys(exchangeRates).length === 0 ||
                            !exchangeRates[fromCurrency] ||
                            !exchangeRates[currency.code]
                          ) {
                            return (
                              <tr key={currency.code} className="border-b">
                                <td className="p-3 flex items-center gap-2">
                                  <span>{currency.flag}</span>
                                  <span>{currency.country}</span>
                                </td>
                                <td className="p-3">{currency.code}</td>
                                <td className="p-3 text-right">Loading...</td>
                                <td className="p-3 text-right">Loading...</td>
                              </tr>
                            )
                          }

                          const fromRate = exchangeRates[fromCurrency] || 1
                          const toRate = exchangeRates[currency.code] || 1
                          const rate = (toRate / fromRate).toFixed(4)
                          const inverseRate = (fromRate / toRate).toFixed(4)

                          return (
                            <tr key={currency.code} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span>{currency.flag}</span>
                                  <span>{currency.country}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span>{currency.code}</span>
                                  <span>{currency.symbol}</span>
                                </div>
                              </td>
                              <td className="p-3 text-right font-medium">{rate}</td>
                              <td className="p-3 text-right">
                                1 {currency.code} = {inverseRate} {fromCurrency}
                              </td>
                            </tr>
                          )
                        })}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, availableCurrencyData.length)} of{" "}
                  {availableCurrencyData.length} currencies
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline">Updated {formattedLastUpdated}</Badge>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
