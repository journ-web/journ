"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef } from "react"
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, subMonths } from "date-fns"
import {
  Calendar,
  ChevronDown,
  MapPin,
  Users,
  Home,
  Utensils,
  Plane,
  Ticket,
  ShoppingBag,
  Sparkles,
  Heart,
  Briefcase,
  ArrowRight,
  DollarSign,
  Clock,
  CalendarIcon,
  Tag,
  CreditCard,
  PieChart,
  Info,
  Lightbulb,
  Globe,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Wallet,
  X,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CurrencySelector } from "@/components/currency-selector" // Import CurrencySelector
import { CURRENCY_DATA } from "@/utils/currency-data" // Import CURRENCY_DATA

import { useTrips } from "@/hooks/use-trips"
import { useExpenses } from "@/hooks/use-expenses"
import { useSplitlyGroups } from "@/hooks/use-splitly-groups"
import { useExchangeRates } from "@/utils/exchange-rates"
import { formatCurrency } from "@/utils/currency"
import type { ExpenseCategory } from "@/types"
import {
  PieChart as RechartsDonut,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { useAllExpenses } from "@/hooks/use-all-expenses"
import { useMediaQuery } from "@/hooks/use-media-query"

// Enhanced Donut Chart Component with improved styling
const DonutChart = ({
  data,
  displayCurrency,
}: { data: { name: string; value: number; color: string }[]; displayCurrency: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const categoryMap: Record<string, React.ReactNode> = {
      Accommodation: <Home className="h-4 w-4" />,
      Food: <Utensils className="h-4 w-4" />,
      Transportation: <Plane className="h-4 w-4" />,
      Activities: <Ticket className="h-4 w-4" />,
      Shopping: <ShoppingBag className="h-4 w-4" />,
      Entertainment: <Sparkles className="h-4 w-4" />,
      Health: <Heart className="h-4 w-4" />,
      Other: <Briefcase className="h-4 w-4" />,
    }

    return categoryMap[category] || <Briefcase className="h-4 w-4" />
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background/95 border rounded-lg shadow-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(data.name)}
            <span className="font-medium text-base">{data.name}</span>
          </div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Amount: </span>
              <span className="font-medium text-foreground">{formatCurrency(data.value, displayCurrency)}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Percentage: </span>
              <span className="font-medium text-foreground">{((data.value / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsDonut>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={90}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            activeIndex={activeIndex !== null ? activeIndex : undefined}
            activeShape={(props) => {
              const RADIAN = Math.PI / 180
              const {
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle,
                fill,
                payload,
                percent,
                value,
              } = props
              const sin = Math.sin(-RADIAN * midAngle)
              const cos = Math.cos(-RADIAN * midAngle)
              const sx = cx + (outerRadius + 10) * cos
              const sy = cy + (outerRadius + 10) * sin
              const mx = cx + (outerRadius + 30) * cos
              const my = cy + (outerRadius + 30) * sin
              const ex = mx + (cos >= 0 ? 1 : -1) * 22
              const ey = my
              const textAnchor = cos >= 0 ? "start" : "end"

              return (
                <g>
                  <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xs font-medium">
                    {payload.name}
                  </text>
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 5}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.8}
                  />
                  <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                  />
                  <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                  <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                  <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    textAnchor={textAnchor}
                    fill="#333"
                    className="text-xs font-medium"
                  >
                    {`${(percent * 100).toFixed(1)}%`}
                  </text>
                  <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey + 15}
                    textAnchor={textAnchor}
                    fill="#999"
                    className="text-xs"
                  >
                    {formatCurrency(value, displayCurrency)}
                  </text>
                </g>
              )
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ paddingLeft: "20px" }}
            formatter={(value, entry, index) => (
              <span className="flex items-center gap-1 text-xs font-medium">
                {getCategoryIcon(value as string)}
                <span>{value}</span>
              </span>
            )}
          />
        </RechartsDonut>
      </ResponsiveContainer>
    </div>
  )
}

// Monthly Spending Bar Chart
const MonthlySpendingChart = ({
  data,
  displayCurrency,
}: { data: { month: string; amount: number }[]; displayCurrency: string }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => formatCurrency(value, displayCurrency)} width={60} />
          <RechartsTooltip
            formatter={(value) => [formatCurrency(value as number, displayCurrency), "Amount"]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Spending Trend Line Chart
const SpendingTrendChart = ({
  data,
  displayCurrency,
}: { data: { date: string; amount: number }[]; displayCurrency: string }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatCurrency(value, displayCurrency)} width={60} />
          <RechartsTooltip
            formatter={(value) => [formatCurrency(value as number, displayCurrency), "Amount"]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Budget vs Actual Area Chart
const BudgetVsActualChart = ({
  data,
  displayCurrency,
}: { data: { category: string; budget: number; actual: number }[]; displayCurrency: string }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={0} barCategoryGap={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" />
          <YAxis tickFormatter={(value) => formatCurrency(value, displayCurrency)} width={60} />
          <RechartsTooltip
            formatter={(value, name) => [
              formatCurrency(value as number, displayCurrency),
              name === "budget" ? "Budget" : "Actual",
            ]}
            labelFormatter={(label) => `Category: ${label}`}
          />
          <Legend formatter={(value) => (value === "budget" ? "Budget" : "Actual Spending")} />
          <Bar dataKey="budget" fill="rgba(59, 130, 246, 0.6)" radius={[4, 4, 0, 0]} name="budget" />
          <Bar dataKey="actual" fill="rgba(37, 99, 235, 0.8)" radius={[4, 4, 0, 0]} name="actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Currency Exchange Rate Chart
const CurrencyExchangeChart = ({
  data,
  fromCurrency,
  toCurrency,
}: { data: { date: string; rate: number }[]; fromCurrency: string; toCurrency: string }) => {
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} tickFormatter={(value) => `${value.toFixed(2)} ${toCurrency}`} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <RechartsTooltip
            formatter={(value) => [`${(value as number).toFixed(4)} ${toCurrency}`, `1 ${fromCurrency} =`]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Area type="monotone" dataKey="rate" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRate)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Date range options
const dateRangeOptions = [
  { label: "This Month", value: "this-month" },
  { label: "Last Month", value: "last-month" },
  { label: "Last 3 Months", value: "last-3-months" },
  { label: "Last 6 Months", value: "last-6-months" },
  { label: "This Year", value: "this-year" },
  { label: "Custom Range", value: "custom" },
]

// Category colors for the pie chart - updated with vibrant, modern palette
const categoryColors: Record<ExpenseCategory, string> = {
  accommodation: "#4361ee", // Soft blue
  food: "#3a86ff", // Bright blue
  transportation: "#4cc9f0", // Light blue
  activities: "#4895ef", // Medium blue
  shopping: "#560bad", // Deep purple
  entertainment: "#7209b7", // Bright purple
  health: "#f72585", // Pink
  other: "#b5179e", // Magenta
}

// Section component for consistent styling with dashboard
const Section = ({
  id,
  title,
  subtitle,
  children,
  className = "",
  action,
}: {
  id?: string
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) => {
  return (
    <div id={id} className={`space-y-4 mb-8 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

// Stat Card component for consistent styling with dashboard
const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className = "",
  onClick,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  onClick?: () => void
}) => {
  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-full bg-primary/10 p-1.5">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-medium">{value}</div>
        {trend && trendValue && (
          <div
            className={`flex items-center text-xs ${
              trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend === "down" ? (
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
            ) : (
              <ArrowRight className="h-3 w-3 mr-1" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Budget Progress Card
const BudgetProgressCard = ({
  category,
  spent,
  budget,
  icon,
  color,
  displayCurrency,
}: {
  category: string
  spent: number
  budget: number
  icon: React.ReactNode
  color: string
  displayCurrency: string
}) => {
  const percentage = Math.min(Math.round((spent / budget) * 100), 100)
  const isOverBudget = spent > budget

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{category}</CardTitle>
        <div className="rounded-full p-1.5" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Spent</span>
          <span className="font-medium">{formatCurrency(spent, displayCurrency)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Budget</span>
          <span className="font-medium">{formatCurrency(budget, displayCurrency)}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span>{percentage}%</span>
            <span className={isOverBudget ? "text-red-500" : ""}>
              {isOverBudget ? "Over budget" : `${formatCurrency(budget - spent, displayCurrency)} left`}
            </span>
          </div>
          <Progress value={percentage} className="h-2" indicatorClassName={isOverBudget ? "bg-red-500" : ""} />
        </div>
      </CardContent>
    </Card>
  )
}

// Insight Card Component
const InsightCard = ({
  icon,
  title,
  description,
  className = "",
}: {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}) => {
  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 mt-0.5">{icon}</div>
          <div className="space-y-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Active Filter Pill Component
const ActiveFilterPill = ({
  label,
  value,
  onRemove,
}: {
  label: string
  value: string
  onRemove: () => void
}) => {
  return (
    <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-primary/20"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

export default function InsightsPage() {
  // Get auth context
  const { user } = useAuth()

  // Media query for responsive design
  const isMobile = !useMediaQuery("(min-width: 640px)")

  // Refs for section navigation
  const tripSummaryRef = useRef<HTMLDivElement>(null)
  const expenseBreakdownRef = useRef<HTMLDivElement>(null)
  const budgetAnalysisRef = useRef<HTMLDivElement>(null)
  const groupSummaryRef = useRef<HTMLDivElement>(null)
  const currencyInsightsRef = useRef<HTMLDivElement>(null)
  const smartInsightsRef = useRef<HTMLDivElement>(null)

  // State for filters
  const [dateRange, setDateRange] = useState<string>("this-month")
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [fetchAllExpenses, setFetchAllExpenses] = useState<boolean>(true)
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [activeSection, setActiveSection] = useState<string>("trip-summary")
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [displayCurrency, setDisplayCurrency] = useState<string>("USD") // New state for display currency

  // Fetch data using existing hooks
  const { trips, loading: tripsLoading } = useTrips()
  const [activeTrip, setActiveTrip] = useState<string | null>(selectedTrip)
  const { expenses: selectedTripExpenses, loading: expensesLoading } = useExpenses(selectedTrip || null)

  // State to track if we need to fetch all expenses
  const { allExpenses: allTripExpenses, loading: loadingAllExpenses } = useAllExpenses(trips)

  const { groups, loading: groupsLoading } = useSplitlyGroups()
  const { rates, convertCurrency } = useExchangeRates()

  // Set initial display currency based on user's home currency
  useEffect(() => {
    if (user?.homeCurrency && CURRENCY_DATA.some((c) => c.code === user.homeCurrency)) {
      setDisplayCurrency(user.homeCurrency)
    }
  }, [user])

  // Calculate date range based on selection
  const dateRangeInterval = useMemo(() => {
    const now = new Date()

    switch (dateRange) {
      case "this-month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        }
      case "last-month":
        const lastMonth = subMonths(now, 1)
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        }
      case "last-3-months":
        return {
          start: startOfMonth(subMonths(now, 2)),
          end: endOfMonth(now),
        }
      case "last-6-months":
        return {
          start: startOfMonth(subMonths(now, 5)),
          end: endOfMonth(now),
        }
      case "this-year":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31),
        }
      case "custom":
        return (
          customDateRange || {
            start: startOfMonth(now),
            end: endOfMonth(now),
          }
        )
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        }
    }
  }, [dateRange, customDateRange])

  // Update the useEffect to set activeTrip when selectedTrip changes
  useEffect(() => {
    setActiveTrip(selectedTrip)

    // If we select a specific trip, we don't need to fetch all expenses
    if (selectedTrip) {
      setFetchAllExpenses(false)
    } else {
      setFetchAllExpenses(true)
    }
  }, [selectedTrip])

  // Filter trips based on date range
  const filteredTrips = useMemo(() => {
    if (tripsLoading) return []

    return trips.filter((trip) => {
      const tripStartDate = parseISO(trip.startDate)
      const tripEndDate = parseISO(trip.endDate)

      // Check if trip overlaps with the selected date range
      return (
        isWithinInterval(tripStartDate, dateRangeInterval) ||
        isWithinInterval(tripEndDate, dateRangeInterval) ||
        (tripStartDate <= dateRangeInterval.start && tripEndDate >= dateRangeInterval.end)
      )
    })
  }, [trips, dateRangeInterval, tripsLoading])

  // Filter expenses based on date range and selected trip
  const filteredExpenses = useMemo(() => {
    // If a specific trip is selected, use its expenses
    if (selectedTrip) {
      if (expensesLoading || !selectedTripExpenses || selectedTripExpenses.length === 0) return []

      return selectedTripExpenses.filter((expense) => {
        const expenseDate = parseISO(expense.date)
        return isWithinInterval(expenseDate, dateRangeInterval)
      })
    }
    // Otherwise, use all expenses from all trips
    else {
      if (loadingAllExpenses || allTripExpenses.length === 0) return []

      return allTripExpenses.filter((expense) => {
        const expenseDate = parseISO(expense.date)
        return isWithinInterval(expenseDate, dateRangeInterval)
      })
    }
  }, [selectedTrip, selectedTripExpenses, expensesLoading, allTripExpenses, loadingAllExpenses, dateRangeInterval])

  // Filter groups based on date range
  const filteredGroups = useMemo(() => {
    if (groupsLoading) return []

    if (selectedGroup) {
      return groups.filter((group) => group.id === selectedGroup)
    }

    return groups
  }, [groups, selectedGroup, groupsLoading])

  // Calculate trip summary metrics
  const tripSummary = useMemo(() => {
    if (filteredTrips.length === 0) {
      return {
        totalTrips: 0,
        frequentDestination: "N/A",
        averageDuration: 0,
        totalBudget: 0,
        upcomingTrips: 0,
        completedTrips: 0,
        ongoingTrips: 0,
      }
    }

    // Count destinations
    const destinationCounts: Record<string, number> = {}
    filteredTrips.forEach((trip) => {
      destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1
    })

    // Find most frequent destination
    const frequentDestination = Object.entries(destinationCounts).sort((a, b) => b[1] - a[1])[0][0]

    // Calculate average duration
    const totalDays = filteredTrips.reduce((sum, trip) => {
      const start = parseISO(trip.startDate)
      const end = parseISO(trip.endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return sum + days
    }, 0)

    // Calculate total budget (converted to displayCurrency)
    const totalBudget = filteredTrips.reduce((sum, trip) => {
      const budgetInHome = trip.budget + trip.miscellaneousFunds + trip.safetyFunds
      return sum + convertCurrency(budgetInHome, trip.homeCurrency, displayCurrency)
    }, 0)

    // Count trip statuses
    const now = new Date()
    const upcomingTrips = filteredTrips.filter((trip) => parseISO(trip.startDate) > now).length
    const completedTrips = filteredTrips.filter((trip) => parseISO(trip.endDate) < now).length
    const ongoingTrips = filteredTrips.filter((trip) => {
      const startDate = parseISO(trip.startDate)
      const endDate = parseISO(trip.endDate)
      return startDate <= now && endDate >= now
    }).length

    return {
      totalTrips: filteredTrips.length,
      frequentDestination,
      averageDuration: Math.round(totalDays / filteredTrips.length),
      totalBudget,
      upcomingTrips,
      completedTrips,
      ongoingTrips,
    }
  }, [filteredTrips, convertCurrency, displayCurrency])

  // Calculate expense summary metrics
  const expenseSummary = useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      return {
        totalSpent: 0,
        highestSpendingDay: "N/A",
        mostUsedCategory: "N/A",
        mostUsedFundType: "N/A",
        categoryBreakdown: [],
        monthlySpending: [],
        dailySpending: [],
        budgetVsActual: [],
      }
    }

    // Calculate total spent (converted to displayCurrency)
    const totalSpent = filteredExpenses.reduce((sum, expense) => {
      // Find the trip associated with this expense to get its homeCurrency
      const trip = trips.find((t) => t.id === expense.tripId)
      const expenseHomeCurrency = trip?.homeCurrency || "USD" // Fallback to USD if trip not found
      return sum + convertCurrency(expense.amountInHomeCurrency || 0, expenseHomeCurrency, displayCurrency)
    }, 0)

    // Find highest spending day
    const spendingByDay: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      const day = expense.date
      const trip = trips.find((t) => t.id === expense.tripId)
      const expenseHomeCurrency = trip?.homeCurrency || "USD"
      spendingByDay[day] =
        (spendingByDay[day] || 0) +
        convertCurrency(expense.amountInHomeCurrency || 0, expenseHomeCurrency, displayCurrency)
    })

    const highestSpendingDayEntries = Object.entries(spendingByDay)
    const highestSpendingDay =
      highestSpendingDayEntries.length > 0 ? highestSpendingDayEntries.sort((a, b) => b[1] - a[1])[0][0] : "N/A"

    // Count categories
    const categoryCounts: Record<string, number> = {}
    const categorySpending: Record<ExpenseCategory, number> = {
      accommodation: 0,
      food: 0,
      transportation: 0,
      activities: 0,
      shopping: 0,
      entertainment: 0,
      health: 0,
      other: 0,
    }

    filteredExpenses.forEach((expense) => {
      if (expense.category) {
        const trip = trips.find((t) => t.id === expense.tripId)
        const expenseHomeCurrency = trip?.homeCurrency || "USD"
        categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1
        categorySpending[expense.category as ExpenseCategory] += convertCurrency(
          expense.amountInHomeCurrency || 0,
          expenseHomeCurrency,
          displayCurrency,
        )
      }
    })

    // Find most used category
    const categoryCountEntries = Object.entries(categoryCounts)
    const mostUsedCategory =
      categoryCountEntries.length > 0 ? categoryCountEntries.sort((a, b) => b[1] - a[1])[0][0] : "N/A"

    // Count fund types
    const fundTypeCounts: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      if (expense.fundType) {
        fundTypeCounts[expense.fundType] = (fundTypeCounts[expense.fundType] || 0) + 1
      }
    })

    // Find most used fund type
    const fundTypeCountEntries = Object.entries(fundTypeCounts)
    const mostUsedFundType =
      fundTypeCountEntries.length > 0 ? fundTypeCountEntries.sort((a, b) => b[1] - a[1])[0][0] : "N/A"

    // Prepare category breakdown for chart
    const categoryBreakdown = Object.entries(categorySpending)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value,
        color: categoryColors[category as ExpenseCategory],
      }))

    // Prepare monthly spending data
    const monthlySpendingMap: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      const date = parseISO(expense.date)
      const monthKey = format(date, "MMM yyyy")
      const trip = trips.find((t) => t.id === expense.tripId)
      const expenseHomeCurrency = trip?.homeCurrency || "USD"
      monthlySpendingMap[monthKey] =
        (monthlySpendingMap[monthKey] || 0) +
        convertCurrency(expense.amountInHomeCurrency || 0, expenseHomeCurrency, displayCurrency)
    })

    const monthlySpending = Object.entries(monthlySpendingMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        // Sort by date (assuming format is "MMM yyyy")
        const dateA = new Date(a.month)
        const dateB = new Date(b.month)
        return dateA.getTime() - dateB.getTime()
      })

    // Prepare daily spending data (for the last 30 days)
    const dailySpendingMap: Record<string, number> = {}
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    filteredExpenses
      .filter((expense) => parseISO(expense.date) >= thirtyDaysAgo)
      .forEach((expense) => {
        const date = parseISO(expense.date)
        const dateKey = format(date, "MMM dd")
        const trip = trips.find((t) => t.id === expense.tripId)
        const expenseHomeCurrency = trip?.homeCurrency || "USD"
        dailySpendingMap[dateKey] =
          (dailySpendingMap[dateKey] || 0) +
          convertCurrency(expense.amountInHomeCurrency || 0, expenseHomeCurrency, displayCurrency)
      })

    const dailySpending = Object.entries(dailySpendingMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })

    // Prepare budget vs actual data
    const budgetVsActual = Object.entries(categorySpending)
      .filter(([_, value]) => value > 0)
      .map(([category, actual]) => {
        // For demo purposes, we'll create a simulated budget
        // In a real app, you'd get this from the user's budget settings
        const budget = actual * (Math.random() * 0.5 + 0.75) // Random budget between 75% and 125% of actual

        return {
          category: category.charAt(0).toUpperCase() + category.slice(1),
          budget,
          actual,
        }
      })

    return {
      totalSpent,
      highestSpendingDay,
      mostUsedCategory,
      mostUsedFundType,
      categoryBreakdown,
      monthlySpending,
      dailySpending,
      budgetVsActual,
    }
  }, [filteredExpenses, convertCurrency, displayCurrency, trips])

  // Calculate group summary metrics
  const groupSummary = useMemo(() => {
    return filteredGroups.map((group) => {
      // Calculate total group expense (converted to displayCurrency)
      const totalGroupExpense = group.expenses.reduce((sum, expense) => {
        return sum + convertCurrency(expense.amount, group.baseCurrency, displayCurrency)
      }, 0)

      // Find the current user's member ID (for demo, we'll use the first member)
      const currentUserId = group.members[0]?.id

      // Calculate how much the user paid (converted to displayCurrency)
      const userPaid = group.expenses
        .filter((expense: any) => expense.paidBy === currentUserId)
        .reduce(
          (sum: number, expense: any) => sum + convertCurrency(expense.amount, group.baseCurrency, displayCurrency),
          0,
        )

      // Calculate balances
      const balances = calculateBalances(group)

      // Find user's balance
      const userBalance = balances.find((balance) => balance.from === currentUserId || balance.to === currentUserId)

      let userOwes = 0
      let userIsOwed = 0

      if (userBalance) {
        if (userBalance.from === currentUserId) {
          userOwes = convertCurrency(userBalance.amount, group.baseCurrency, displayCurrency)
        } else {
          userIsOwed = convertCurrency(userBalance.amount, group.baseCurrency, displayCurrency)
        }
      }

      return {
        group,
        totalGroupExpense,
        userPaid,
        userOwes,
        userIsOwed,
        netBalance: userIsOwed - userOwes,
        balances: balances.map((b) => ({
          ...b,
          amount: convertCurrency(b.amount, group.baseCurrency, displayCurrency),
        })),
      }
    })
  }, [filteredGroups, convertCurrency, displayCurrency])

  // Helper function to calculate balances (simplified version of the one in useSplitlyGroups)
  function calculateBalances(group: any) {
    const balanceMap: Record<string, Record<string, number>> = {}

    // Initialize balance map
    group.members.forEach((member1: any) => {
      balanceMap[member1.id] = {}
      group.members.forEach((member2: any) => {
        if (member1.id !== member2.id) {
          balanceMap[member1.id][member2.id] = 0
        }
      })
    })

    // Process expenses
    group.expenses.forEach((expense: any) => {
      const paidBy = expense.paidBy

      expense.participants.forEach((participant: any) => {
        const participantId = participant.memberId

        if (paidBy !== participantId) {
          balanceMap[participantId][paidBy] += participant.amount
          balanceMap[paidBy][participantId] -= participant.amount
        }
      })
    })

    // Process settlements
    group.settlements.forEach((settlement: any) => {
      const paidBy = settlement.paidBy
      const paidTo = settlement.paidTo

      balanceMap[paidBy][paidTo] -= settlement.amount
      balanceMap[paidTo][paidBy] += settlement.amount
    })

    // Convert to balance list
    const balances: { from: string; to: string; amount: number }[] = []

    for (let i = 0; i < group.members.length; i++) {
      for (let j = i + 1; j < group.members.length; j++) {
        const member1 = group.members[i]
        const member2 = group.members[j]

        const member1OwesToMember2 = balanceMap[member1.id][member2.id]

        if (member1OwesToMember2 > 0.01) {
          balances.push({
            from: member1.id,
            to: member2.id,
            amount: member1OwesToMember2,
          })
        } else if (member1OwesToMember2 < -0.01) {
          balances.push({
            from: member2.id,
            to: member1.id,
            amount: Math.abs(member1OwesToMember2),
          })
        }
      }
    }

    return balances
  }

  // Calculate currency insights
  const currencyInsights = useMemo(() => {
    // Count currency usage in trips
    const tripCurrencies: Record<string, number> = {}
    filteredTrips.forEach((trip) => {
      tripCurrencies[trip.tripCurrency] = (tripCurrencies[trip.tripCurrency] || 0) + 1
    })

    // Count currency pairs in trips
    const currencyPairs: Record<string, number> = {}
    filteredTrips.forEach((trip) => {
      const pair = `${trip.homeCurrency} → ${trip.tripCurrency}`
      currencyPairs[pair] = (currencyPairs[pair] || 0) + 1
    })

    // Find most used currencies
    const mostUsedCurrencies = Object.entries(tripCurrencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([currency, count]) => ({ currency, count }))

    // Find most used currency pairs
    const mostUsedPairs = Object.entries(currencyPairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pair, count]) => ({ pair, count }))

    // Generate mock exchange rate data for visualization
    // For demo, we'll show a trend for USD to the selected display currency
    const baseCurrencyForChart = "USD" // Fixed base for the mock chart
    const targetCurrencyForChart = displayCurrency

    const exchangeRateData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))

      // Generate a random rate that fluctuates slightly around a base value
      // This is a mock, so we'll simulate a rate relative to USD
      const baseRate = rates[baseCurrencyForChart]?.[targetCurrencyForChart] || 1.0 // Use actual rate if available, else 1.0
      const fluctuation = (Math.random() - 0.5) * 0.05 * baseRate // Random fluctuation
      const rate = baseRate + fluctuation

      return {
        date: format(date, "MMM dd"),
        rate,
      }
    })

    return {
      mostUsedCurrencies,
      mostUsedPairs,
      exchangeRateData,
      baseCurrencyForChart,
      targetCurrencyForChart,
    }
  }, [filteredTrips, displayCurrency, rates])

  // Generate smart insights
  const smartInsights = useMemo(() => {
    const insights: { icon: React.ReactNode; text: string; category: string }[] = []

    if (filteredExpenses.length > 0) {
      // Insight about most expensive category
      const mostExpensiveCategory = expenseSummary.categoryBreakdown[0]?.name
      const categoryPercentage = Math.round(
        (expenseSummary.categoryBreakdown[0]?.value / expenseSummary.totalSpent) * 100,
      )

      if (mostExpensiveCategory && categoryPercentage) {
        insights.push({
          icon: <PieChart className="h-5 w-5 text-primary" />,
          text: `${mostExpensiveCategory} expenses account for ${categoryPercentage}% of your total spending.`,
          category: "Spending Patterns",
        })
      }

      // Insight about spending patterns by day of week
      const spendingByDayOfWeek: Record<number, number> = {}
      filteredExpenses.forEach((expense) => {
        const date = parseISO(expense.date)
        const dayOfWeek = date.getDay()
        const trip = trips.find((t) => t.id === expense.tripId)
        const expenseHomeCurrency = trip?.homeCurrency || "USD"
        spendingByDayOfWeek[dayOfWeek] =
          (spendingByDayOfWeek[dayOfWeek] || 0) +
          convertCurrency(expense.amountInHomeCurrency, expenseHomeCurrency, displayCurrency)
      })

      const highestSpendingDay = Object.entries(spendingByDayOfWeek).sort((a, b) => Number(b[1]) - Number(a[1]))[0]

      if (highestSpendingDay) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        insights.push({
          icon: <Calendar className="h-5 w-5 text-primary" />,
          text: `You tend to spend more on ${dayNames[Number(highestSpendingDay[0])]}.`,
          category: "Spending Patterns",
        })
      }

      // Insight about spending trend
      if (expenseSummary.monthlySpending.length > 1) {
        const lastMonth = expenseSummary.monthlySpending[expenseSummary.monthlySpending.length - 1]
        const previousMonth = expenseSummary.monthlySpending[expenseSummary.monthlySpending.length - 2]

        if (lastMonth && previousMonth) {
          const percentChange = ((lastMonth.amount - previousMonth.amount) / previousMonth.amount) * 100

          if (Math.abs(percentChange) > 10) {
            // Only show if change is significant
            insights.push({
              icon: <TrendingUp className={`h-5 w-5 ${percentChange > 0 ? "text-red-500" : "text-green-500"}`} />,
              text: `Your spending ${percentChange > 0 ? "increased" : "decreased"} by ${Math.abs(percentChange).toFixed(1)}% compared to the previous month.`,
              category: "Spending Trends",
            })
          }
        }
      }
    }

    if (filteredTrips.length > 0) {
      // Insight about trip duration
      if (tripSummary.averageDuration > 0) {
        insights.push({
          icon: <Clock className="h-5 w-5 text-primary" />,
          text: `Your average trip duration is ${tripSummary.averageDuration} days.`,
          category: "Trip Behavior",
        })
      }

      // Insight about trip budget
      const averageBudget = Math.round(tripSummary.totalBudget / filteredTrips.length)
      if (averageBudget > 0) {
        insights.push({
          icon: <DollarSign className="h-5 w-5 text-primary" />,
          text: `You budget an average of ${formatCurrency(averageBudget, displayCurrency)} per trip.`,
          category: "Budgeting Trends",
        })
      }

      // Insight about upcoming trips
      if (tripSummary.upcomingTrips > 0) {
        insights.push({
          icon: <Plane className="h-5 w-5 text-primary" />,
          text: `You have ${tripSummary.upcomingTrips} upcoming ${tripSummary.upcomingTrips === 1 ? "trip" : "trips"} planned.`,
          category: "Trip Planning",
        })
      }
    }

    // Add insights about group expenses if available
    if (groupSummary.length > 0) {
      const totalOwed = groupSummary.reduce((sum, group) => sum + group.userIsOwed, 0)
      const totalOwes = groupSummary.reduce((sum, group) => sum + group.userOwes, 0)

      if (totalOwed > 0 || totalOwes > 0) {
        const netBalance = totalOwed - totalOwes

        insights.push({
          icon: <Users className="h-5 w-5 text-primary" />,
          text:
            netBalance >= 0
              ? `Overall, you are owed ${formatCurrency(netBalance, displayCurrency)} across all your groups.`
              : `Overall, you owe ${formatCurrency(Math.abs(netBalance), displayCurrency)} across all your groups.`,
          category: "Group Expenses",
        })
      }
    }

    // Add currency insights
    if (currencyInsights.mostUsedCurrencies.length > 0) {
      insights.push({
        icon: <Globe className="h-5 w-5 text-primary" />,
        text: `Your most used currency is ${currencyInsights.mostUsedCurrencies[0].currency} (${currencyInsights.mostUsedCurrencies[0].count} trips).`,
        category: "Currency Usage",
      })
    }

    return insights
  }, [
    filteredExpenses,
    filteredTrips,
    expenseSummary,
    tripSummary,
    groupSummary,
    currencyInsights,
    convertCurrency,
    displayCurrency,
    trips,
  ])

  // Group insights by category
  const groupedInsights = useMemo(() => {
    const grouped: Record<string, { icon: React.ReactNode; text: string }[]> = {}

    smartInsights.forEach((insight) => {
      if (!grouped[insight.category]) {
        grouped[insight.category] = []
      }
      grouped[insight.category].push({
        icon: insight.icon,
        text: insight.text,
      })
    })

    return grouped
  }, [smartInsights])

  // Loading state
  const isLoading = tripsLoading || (selectedTrip ? expensesLoading : loadingAllExpenses) || groupsLoading

  // Empty state check
  const isEmpty =
    !isLoading && filteredTrips.length === 0 && filteredExpenses.length === 0 && filteredGroups.length === 0

  // Scroll to section function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
      // Update active section
      setActiveSection(ref.current.id || "")
    }
  }

  // Navigation items
  const navigationItems = [
    { id: "trip-summary", label: "Trip Summary", ref: tripSummaryRef, icon: <Plane className="h-4 w-4" /> },
    {
      id: "expense-breakdown",
      label: "Expense Breakdown",
      ref: expenseBreakdownRef,
      icon: <PieChart className="h-4 w-4" />,
    },
    { id: "budget-analysis", label: "Budget Analysis", ref: budgetAnalysisRef, icon: <Wallet className="h-4 w-4" /> },
    { id: "group-summary", label: "Group Summary", ref: groupSummaryRef, icon: <Users className="h-4 w-4" /> },
    {
      id: "currency-insights",
      label: "Currency Insights",
      ref: currencyInsightsRef,
      icon: <Globe className="h-4 w-4" />,
    },
    { id: "smart-insights", label: "Smart Insights", ref: smartInsightsRef, icon: <Lightbulb className="h-4 w-4" /> },
  ]

  // Get active filters for display
  const activeFilters = useMemo(() => {
    const filters = []

    if (dateRange !== "this-month") {
      filters.push({
        label: "Date",
        value: dateRangeOptions.find((option) => option.value === dateRange)?.label || dateRange,
        onRemove: () => setDateRange("this-month"),
      })
    }

    if (selectedTrip) {
      filters.push({
        label: "Trip",
        value: trips.find((trip) => trip.id === selectedTrip)?.name || "Selected Trip",
        onRemove: () => setSelectedTrip(null),
      })
    }

    if (selectedGroup) {
      filters.push({
        label: "Group",
        value: groups.find((group) => group.id === selectedGroup)?.name || "Selected Group",
        onRemove: () => setSelectedGroup(null),
      })
    }

    if (displayCurrency !== (user?.homeCurrency || "USD")) {
      // Only show if not default
      filters.push({
        label: "Display Currency",
        value: displayCurrency,
        onRemove: () => setDisplayCurrency(user?.homeCurrency || "USD"),
      })
    }

    return filters
  }, [dateRange, selectedTrip, selectedGroup, displayCurrency, trips, groups, user?.homeCurrency])

  return (
    <div className="space-y-6 pb-10">
      {/* Sticky Header & Filters */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b pb-3 -mx-4 md:-mx-6 px-4 md:px-6 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground text-sm">
              Discover patterns and analytics about your trips and expenses
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter button - Mobile */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sm:hidden">Filters</span>
              <span className="hidden sm:inline">Filter</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>

            {/* Navigation dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  {navigationItems.find((item) => item.id === activeSection)?.icon}
                  <span className="hidden sm:inline">
                    {navigationItems.find((item) => item.id === activeSection)?.label || "Navigate"}
                  </span>
                  <span className="sm:hidden">Sections</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Jump to Section</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {navigationItems.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => scrollToSection(item.ref)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {activeSection === item.id && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Navigation buttons */}
            <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const currentIndex = navigationItems.findIndex((item) => item.id === activeSection)
                  if (currentIndex > 0) {
                    scrollToSection(navigationItems[currentIndex - 1].ref)
                  }
                }}
                disabled={navigationItems.findIndex((item) => item.id === activeSection) <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Section</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const currentIndex = navigationItems.findIndex((item) => item.id === activeSection)
                  if (currentIndex < navigationItems.length - 1) {
                    scrollToSection(navigationItems[currentIndex + 1].ref)
                  }
                }}
                disabled={navigationItems.findIndex((item) => item.id === activeSection) >= navigationItems.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Section</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {activeFilters.map((filter, index) => (
              <ActiveFilterPill key={index} label={filter.label} value={filter.value} onRemove={filter.onRemove} />
            ))}
            {activeFilters.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setDateRange("this-month")
                  setSelectedTrip(null)
                  setSelectedGroup(null)
                  setDisplayCurrency(user?.homeCurrency || "USD")
                }}
              >
                Clear all
              </Button>
            )}
          </div>
        )}

        {/* Filter Drawer - Shown when filter button is clicked */}
        {isFilterDrawerOpen && (
          <div className="mt-3 p-3 border rounded-lg bg-background/50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsFilterDrawerOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="space-y-3">
              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Date Range</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dateRangeOptions.slice(0, 6).map((option) => (
                    <Button
                      key={option.value}
                      variant={dateRange === option.value ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setDateRange(option.value)
                        if (!isMobile) setIsFilterDrawerOpen(false)
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Trip Filter */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Trip</label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1">
                  <Button
                    variant={selectedTrip === null ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedTrip(null)
                      if (!isMobile) setIsFilterDrawerOpen(false)
                    }}
                  >
                    All Trips
                  </Button>
                  {trips.map((trip) => (
                    <Button
                      key={trip.id}
                      variant={selectedTrip === trip.id ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedTrip(trip.id)
                        if (!isMobile) setIsFilterDrawerOpen(false)
                      }}
                    >
                      {trip.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Group Filter */}
              {groups.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Group</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1">
                    <Button
                      variant={selectedGroup === null ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedGroup(null)
                        if (!isMobile) setIsFilterDrawerOpen(false)
                      }}
                    >
                      All Groups
                    </Button>
                    {groups.map((group) => (
                      <Button
                        key={group.id}
                        variant={selectedGroup === group.id ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedGroup(group.id)
                          if (!isMobile) setIsFilterDrawerOpen(false)
                        }}
                      >
                        {group.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Currency Selector */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Display Currency</label>
                <CurrencySelector
                  value={displayCurrency}
                  onValueChange={setDisplayCurrency}
                  placeholder="Select display currency"
                />
              </div>

              {/* Apply/Close buttons for mobile */}
              {isMobile && (
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRange("this-month")
                      setSelectedTrip(null)
                      setSelectedGroup(null)
                      setDisplayCurrency(user?.homeCurrency || "USD")
                    }}
                  >
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => setIsFilterDrawerOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState
          type="trips"
          title="No data available"
          description="There is no data available for the selected filters. Try changing your filters or add some trips and expenses."
        />
      ) : (
        <>
          {/* Trip Summary Section */}
          <Section
            id="trip-summary"
            title="Trip Summary"
            subtitle="Overview of your travel activity"
            ref={tripSummaryRef}
            action={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">View Details</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View detailed trip statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Trips"
                value={tripSummary.totalTrips}
                icon={<Plane className="h-4 w-4 text-primary" />}
                trend="up"
                trendValue={`${tripSummary.upcomingTrips} upcoming`}
              />
              <StatCard
                title="Frequent Destination"
                value={tripSummary.frequentDestination}
                icon={<MapPin className="h-4 w-4 text-primary" />}
              />
              <StatCard
                title="Average Duration"
                value={`${tripSummary.averageDuration} days`}
                icon={<Clock className="h-4 w-4 text-primary" />}
              />
              <StatCard
                title="Total Budget"
                value={formatCurrency(tripSummary.totalBudget, displayCurrency)}
                icon={<DollarSign className="h-4 w-4 text-primary" />}
              />
            </div>

            {/* Trip Status Distribution */}
            <div className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Trip Status Distribution</CardTitle>
                  <CardDescription>Breakdown of your trips by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span>Upcoming</span>
                        </div>
                        <span className="font-medium">{tripSummary.upcomingTrips}</span>
                      </div>
                      <Progress
                        value={
                          tripSummary.totalTrips > 0 ? (tripSummary.upcomingTrips / tripSummary.totalTrips) * 100 : 0
                        }
                        className="h-2"
                        indicatorClassName="bg-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>Ongoing</span>
                        </div>
                        <span className="font-medium">{tripSummary.ongoingTrips}</span>
                      </div>
                      <Progress
                        value={
                          tripSummary.totalTrips > 0 ? (tripSummary.ongoingTrips / tripSummary.totalTrips) * 100 : 0
                        }
                        className="h-2"
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span>Completed</span>
                        </div>
                        <span className="font-medium">{tripSummary.completedTrips}</span>
                      </div>
                      <Progress
                        value={
                          tripSummary.totalTrips > 0 ? (tripSummary.completedTrips / tripSummary.totalTrips) * 100 : 0
                        }
                        className="h-2"
                        indicatorClassName="bg-purple-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Expense Breakdown Section */}
          <Section
            id="expense-breakdown"
            title="Expense Breakdown"
            subtitle="Analysis of your spending patterns"
            ref={expenseBreakdownRef}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-4 grid-cols-2">
                <StatCard
                  title="Total Spent"
                  value={formatCurrency(expenseSummary.totalSpent, displayCurrency)}
                  icon={<CreditCard className="h-4 w-4 text-primary" />}
                />
                <StatCard
                  title="Highest Spending Day"
                  value={
                    expenseSummary.highestSpendingDay !== "N/A"
                      ? format(parseISO(expenseSummary.highestSpendingDay), "MMM d")
                      : "N/A"
                  }
                  icon={<CalendarIcon className="h-4 w-4 text-primary" />}
                />
                <StatCard
                  title="Most Used Category"
                  value={
                    expenseSummary.mostUsedCategory !== "N/A"
                      ? expenseSummary.mostUsedCategory.charAt(0).toUpperCase() +
                        expenseSummary.mostUsedCategory.slice(1)
                      : "N/A"
                  }
                  icon={<Tag className="h-4 w-4 text-primary" />}
                />
                <StatCard
                  title="Most Used Fund"
                  value={
                    expenseSummary.mostUsedFundType !== "N/A"
                      ? expenseSummary.mostUsedFundType.charAt(0).toUpperCase() +
                        expenseSummary.mostUsedFundType.slice(1)
                      : "N/A"
                  }
                  icon={<Briefcase className="h-4 w-4 text-primary" />}
                />
              </div>

              <Card className="md:row-span-2 shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                  <CardDescription>Breakdown of expenses by category</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pt-4 overflow-hidden">
                  {expenseSummary.categoryBreakdown.length > 0 ? (
                    <DonutChart data={expenseSummary.categoryBreakdown} displayCurrency={displayCurrency} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                      <div className="mb-2">
                        <Briefcase className="h-10 w-10 opacity-20" />
                      </div>
                      <p>No expense data available</p>
                      <p className="text-xs mt-1">Add expenses to see your spending breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Spending Trend */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trend</CardTitle>
                  <CardDescription>How your expenses have changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {expenseSummary.monthlySpending.length > 0 ? (
                    <MonthlySpendingChart data={expenseSummary.monthlySpending} displayCurrency={displayCurrency} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                      <div className="mb-2">
                        <BarChart3 className="h-10 w-10 opacity-20" />
                      </div>
                      <p>No monthly spending data available</p>
                      <p className="text-xs mt-1">Add more expenses to see your spending trends</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Daily Spending Trend */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Spending Pattern</CardTitle>
                  <CardDescription>Your spending over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {expenseSummary.dailySpending.length > 0 ? (
                    <SpendingTrendChart data={expenseSummary.dailySpending} displayCurrency={displayCurrency} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                      <div className="mb-2">
                        <TrendingUp className="h-10 w-10 opacity-20" />
                      </div>
                      <p>No recent spending data available</p>
                      <p className="text-xs mt-1">Add expenses to see your daily spending pattern</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Budget Analysis Section */}
          <Section
            id="budget-analysis"
            title="Budget Analysis"
            subtitle="Compare your actual spending against budgets"
            ref={budgetAnalysisRef}
          >
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs. Actual Spending</CardTitle>
                  <CardDescription>How your actual expenses compare to your budgets</CardDescription>
                </CardHeader>
                <CardContent>
                  {expenseSummary.budgetVsActual.length > 0 ? (
                    <BudgetVsActualChart data={expenseSummary.budgetVsActual} displayCurrency={displayCurrency} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                      <div className="mb-2">
                        <Wallet className="h-10 w-10 opacity-20" />
                      </div>
                      <p>No budget comparison data available</p>
                      <p className="text-xs mt-1">Set budgets and add expenses to see comparisons</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budget Progress Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {expenseSummary.budgetVsActual.slice(0, 4).map((item, index) => (
                  <BudgetProgressCard
                    key={index}
                    category={item.category}
                    spent={item.actual}
                    budget={item.budget}
                    displayCurrency={displayCurrency}
                    icon={
                      item.category === "Accommodation" ? (
                        <Home className="h-4 w-4 text-primary" />
                      ) : item.category === "Food" ? (
                        <Utensils className="h-4 w-4 text-primary" />
                      ) : item.category === "Transportation" ? (
                        <Plane className="h-4 w-4 text-primary" />
                      ) : item.category === "Activities" ? (
                        <Ticket className="h-4 w-4 text-primary" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-primary" />
                      )
                    }
                    color={
                      item.category === "Accommodation"
                        ? "#4361ee"
                        : item.category === "Food"
                          ? "#3a86ff"
                          : item.category === "Transportation"
                            ? "#4cc9f0"
                            : item.category === "Activities"
                              ? "#4895ef"
                              : "#b5179e"
                    }
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* Group (Splitly) Summary Section */}
          {groupSummary.length > 0 && (
            <Section
              id="group-summary"
              title="Group Summary"
              subtitle="Overview of your shared expenses"
              ref={groupSummaryRef}
            >
              <Accordion type="single" collapsible className="w-full">
                {groupSummary.map((summary) => (
                  <AccordionItem
                    key={summary.group.id}
                    value={summary.group.id}
                    className="border rounded-lg mb-3 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <AccordionTrigger className="hover:no-underline px-4 py-3">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 p-1.5 rounded-full">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{summary.group.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">Total</span>
                            <span className="font-medium">
                              {formatCurrency(summary.totalGroupExpense, displayCurrency)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">Net Balance</span>
                            <span
                              className={`font-medium ${summary.netBalance >= 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              {summary.netBalance >= 0 ? "+" : ""}
                              {formatCurrency(summary.netBalance, displayCurrency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-2 px-4 pb-4">
                        {/* Group Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="bg-gradient-to-br from-background to-muted/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">You Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-xl font-bold">
                                {formatCurrency(summary.userPaid, displayCurrency)}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-gradient-to-br from-background to-red-50 dark:from-background dark:to-red-950/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">You Owe</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-xl font-bold text-red-500">
                                {formatCurrency(summary.userOwes, displayCurrency)}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-gradient-to-br from-background to-green-50 dark:from-background dark:to-green-950/10">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">You Are Owed</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-xl font-bold text-green-500">
                                {formatCurrency(summary.userIsOwed, displayCurrency)}
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            className={`bg-gradient-to-br ${
                              summary.netBalance >= 0
                                ? "from-background to-green-50 dark:from-background dark:to-green-950/10"
                                : "from-background to-red-50 dark:from-background dark:to-red-950/10"
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div
                                className={`text-xl font-bold ${summary.netBalance >= 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {summary.netBalance >= 0 ? "+" : ""}
                                {formatCurrency(summary.netBalance, displayCurrency)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Tabs for Balances and Settlements */}
                        <Tabs defaultValue="balances" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="balances">Outstanding Balances</TabsTrigger>
                            <TabsTrigger value="settlements">Settlement History</TabsTrigger>
                          </TabsList>
                          <TabsContent value="balances">
                            {summary.balances.length > 0 ? (
                              <div className="rounded-lg border overflow-hidden">
                                <Table>
                                  <TableHeader className="bg-muted/50">
                                    <TableRow>
                                      <TableHead>From</TableHead>
                                      <TableHead>To</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {summary.balances.map((balance, i) => (
                                      <TableRow key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                        <TableCell>
                                          {summary.group.members.find((m) => m.id === balance.from)?.name}
                                        </TableCell>
                                        <TableCell>
                                          {summary.group.members.find((m) => m.id === balance.to)?.name}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          {formatCurrency(balance.amount, displayCurrency)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/10">
                                <div className="flex justify-center mb-2">
                                  <Info className="h-10 w-10 text-muted-foreground/40" />
                                </div>
                                <p>No outstanding balances</p>
                                <p className="text-xs mt-1">Everyone is settled up!</p>
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value="settlements">
                            {summary.group.settlements.length > 0 ? (
                              <div className="rounded-lg border overflow-hidden">
                                <Table>
                                  <TableHeader className="bg-muted/50">
                                    <TableRow>
                                      <TableHead>Paid By</TableHead>
                                      <TableHead>Paid To</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Note</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {summary.group.settlements.map((settlement, i) => (
                                      <TableRow
                                        key={settlement.id}
                                        className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                                      >
                                        <TableCell>
                                          {summary.group.members.find((m) => m.id === settlement.paidBy)?.name}
                                        </TableCell>
                                        <TableCell>
                                          {summary.group.members.find((m) => m.id === settlement.paidTo)?.name}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          {formatCurrency(settlement.amount, displayCurrency)}
                                        </TableCell>
                                        <TableCell>{format(parseISO(settlement.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell>{settlement.notes || "-"}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/10">
                                <div className="flex justify-center mb-2">
                                  <Info className="h-10 w-10 text-muted-foreground/40" />
                                </div>
                                <p>No settlements recorded</p>
                                <p className="text-xs mt-1">Record settlements to track payments between members</p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Section>
          )}

          {/* Currency Snapshot Section */}
          <Section
            id="currency-insights"
            title="Currency Insights"
            subtitle="Analysis of currency usage and exchange rates"
            ref={currencyInsightsRef}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Currency Usage
                  </CardTitle>
                  <CardDescription>Currencies used in your trips</CardDescription>
                </CardHeader>
                <CardContent>
                  {currencyInsights.mostUsedCurrencies.length > 0 ? (
                    <div className="space-y-3">
                      {currencyInsights.mostUsedCurrencies.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono bg-primary/10">
                              {item.currency}
                            </Badge>
                            <span>
                              {item.count} {item.count === 1 ? "trip" : "trips"}
                            </span>
                          </div>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${(item.count / currencyInsights.mostUsedCurrencies[0].count) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">No currency data available</div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    Currency Conversions
                  </CardTitle>
                  <CardDescription>Most frequent currency pairs</CardDescription>
                </CardHeader>
                <CardContent>
                  {currencyInsights.mostUsedPairs.length > 0 ? (
                    <div className="space-y-3">
                      {currencyInsights.mostUsedPairs.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono bg-primary/10">
                              {item.pair}
                            </Badge>
                            <span>
                              {item.count} {item.count === 1 ? "conversion" : "conversions"}
                            </span>
                          </div>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${(item.count / currencyInsights.mostUsedPairs[0].count) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">No conversion data available</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Exchange Rate Chart */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exchange Rate Trends</CardTitle>
                  <CardDescription>
                    Historical exchange rate data for 1 {currencyInsights.baseCurrencyForChart} to{" "}
                    {currencyInsights.targetCurrencyForChart}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currencyInsights.exchangeRateData.length > 0 ? (
                    <CurrencyExchangeChart
                      data={currencyInsights.exchangeRateData}
                      fromCurrency={currencyInsights.baseCurrencyForChart}
                      toCurrency={currencyInsights.targetCurrencyForChart}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[250px] text-center text-muted-foreground">
                      <div className="mb-2">
                        <Globe className="h-10 w-10 opacity-20" />
                      </div>
                      <p>No exchange rate data available</p>
                      <p className="text-xs mt-1">Add trips with different currencies to see exchange rate trends</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Smart Insights Section */}
          {smartInsights.length > 0 && (
            <Section
              id="smart-insights"
              title="Smart Insights"
              subtitle="AI-powered analysis of your travel patterns"
              ref={smartInsightsRef}
            >
              <Card className="shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Travel Patterns
                  </CardTitle>
                  <CardDescription>Insights based on your travel data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupedInsights).map(([category, insights], categoryIndex) => (
                      <div key={categoryIndex} className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                          {category}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {insights.map((insight, index) => (
                            <InsightCard
                              key={index}
                              icon={insight.icon}
                              title={`Insight #${index + 1}`}
                              description={insight.text}
                            />
                          ))}
                        </div>
                        {categoryIndex < Object.entries(groupedInsights).length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Insights are generated based on your travel history and spending patterns</span>
                  </div>
                </CardFooter>
              </Card>
            </Section>
          )}
        </>
      )}
    </div>
  )
}
