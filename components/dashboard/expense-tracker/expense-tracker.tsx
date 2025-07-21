"use client"

import { useState, useMemo, useEffect } from "react"
import { format, parseISO, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Filter,
  Search,
  X,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  BarChart3,
  PieChartIcon,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw,
  Tag,
  FileText,
  Shield,
  MoreHorizontal,
  Download,
  CalendarDays,
  ArrowUpDown,
  Eye,
  EyeOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import { useExpenses } from "@/hooks/use-expenses"
import { useTripDetails } from "@/hooks/use-trips"
import { formatCurrency } from "@/utils/currency"
import { useExchangeRates } from "@/utils/exchange-rates"
import { calculateFundsStatus } from "@/utils/trip-utils"
import { expenseCategories } from "@/utils/constants"
import type { Expense, ExpenseCategory, FundType } from "@/types/trip"
import { useResponsive } from "@/hooks/use-responsive"
import { ExpenseForm } from "@/components/dashboard/trip-planner/expense-form"

import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { useToast } from "@/hooks/use-toast"

// Helper function to get category details
const getCategoryDetails = (categoryValue: string) => {
  return (
    expenseCategories.find((cat) => cat.value === categoryValue) || {
      value: categoryValue,
      label: categoryValue,
      icon: <Tag className="h-4 w-4" />,
    }
  )
}

// Date range options
const DATE_RANGES = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Custom Range", value: "custom" },
]

// Color palette for charts
const CHART_COLORS = [
  "#FF5A5F", // Primary pink
  "#7C5DFA", // Purple
  "#00C4B4", // Teal
  "#FFB74D", // Orange
  "#4ECDC4", // Mint
  "#FF8A65", // Coral
  "#A0D468", // Green
  "#AC92EC", // Lavender
]

export function ExpenseTracker({ tripId }: { tripId: string }) {
  // Hooks for data
  const { trip, loading: tripLoading, refreshTrip } = useTripDetails(tripId)
  const { expenses, loading: expensesLoading, addExpense, updateExpenseDetails, removeExpense } = useExpenses(tripId)
  const { convertCurrency } = useExchangeRates()
  const { toast } = useToast()

  // Add responsive hook
  const { isMobile, isTablet, isDesktop, windowWidth } = useResponsive()

  // UI state
  const [activeView, setActiveView] = useState<"list" | "analytics" | "budget">("list")
  const [dateRange, setDateRange] = useState("month")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [fundTypeFilter, setFundTypeFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [showConversion, setShowConversion] = useState(true)
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)

  // Expense form state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false)
  const [isDeleteExpenseOpen, setIsDeleteExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [expenseFormData, setExpenseFormData] = useState({
    name: "",
    category: "food" as ExpenseCategory,
    date: format(new Date(), "yyyy-MM-dd"),
    amount: 0,
    notes: "",
    fundType: "budget" as FundType,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Custom date range state
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  })

  // Reset form when opening add expense modal
  useEffect(() => {
    if (isAddExpenseOpen) {
      setExpenseFormData({
        name: "",
        category: "food",
        date: format(new Date(), "yyyy-MM-dd"),
        amount: 0,
        notes: "",
        fundType: "budget",
      })
      setFormErrors({})
    }
  }, [isAddExpenseOpen])

  // Populate form when editing an expense
  useEffect(() => {
    if (selectedExpense && isEditExpenseOpen) {
      setExpenseFormData({
        name: selectedExpense.name,
        category: selectedExpense.category,
        date: selectedExpense.date,
        amount: selectedExpense.amount,
        notes: selectedExpense.notes || "",
        fundType: selectedExpense.fundType,
      })
      setFormErrors({})
    }
  }, [selectedExpense, isEditExpenseOpen])

  // Filter expenses based on active filters
  const filteredExpenses = useMemo(() => {
    if (!expenses) return []

    return expenses.filter((expense) => {
      // Filter by date range
      if (dateRange !== "all") {
        const expenseDate = parseISO(expense.date)
        const today = new Date()

        if (dateRange === "today") {
          const todayStr = format(today, "yyyy-MM-dd")
          if (expense.date !== todayStr) return false
        } else if (dateRange === "yesterday") {
          const yesterdayStr = format(subDays(today, 1), "yyyy-MM-dd")
          if (expense.date !== yesterdayStr) return false
        } else if (dateRange === "week") {
          const weekStart = subDays(today, 7)
          if (expenseDate < weekStart) return false
        } else if (dateRange === "month") {
          const monthStart = startOfMonth(today)
          const monthEnd = endOfMonth(today)
          if (!isWithinInterval(expenseDate, { start: monthStart, end: monthEnd })) return false
        } else if (dateRange === "lastMonth") {
          const lastMonthStart = startOfMonth(subDays(today, 30))
          const lastMonthEnd = endOfMonth(subDays(today, 30))
          if (!isWithinInterval(expenseDate, { start: lastMonthStart, end: lastMonthEnd })) return false
        } else if (dateRange === "custom") {
          const start = parseISO(customDateRange.startDate)
          const end = parseISO(customDateRange.endDate)
          if (!isWithinInterval(expenseDate, { start, end })) return false
        }
      }

      // Filter by category
      if (categoryFilter && expense.category !== categoryFilter) return false

      // Filter by fund type
      if (fundTypeFilter && expense.fundType !== fundTypeFilter) return false

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          expense.name.toLowerCase().includes(query) ||
          expense.notes?.toLowerCase().includes(query) ||
          getCategoryDetails(expense.category).label.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [expenses, dateRange, categoryFilter, fundTypeFilter, searchQuery, customDateRange])

  // Sort filtered expenses
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
      } else if (sortBy === "amount") {
        return sortOrder === "asc"
          ? a.amountInHomeCurrency - b.amountInHomeCurrency
          : b.amountInHomeCurrency - a.amountInHomeCurrency
      } else if (sortBy === "category") {
        return sortOrder === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
      }
      return 0
    })
  }, [filteredExpenses, sortBy, sortOrder])

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const grouped: Record<string, Expense[]> = {}

    sortedExpenses.forEach((expense) => {
      if (!grouped[expense.date]) {
        grouped[expense.date] = []
      }
      grouped[expense.date].push(expense)
    })

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        return sortOrder === "asc" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)
      })
      .map(([date, expenses]) => ({
        date,
        expenses: expenses.sort((a, b) => {
          if (sortBy === "amount") {
            return sortOrder === "asc"
              ? a.amountInHomeCurrency - b.amountInHomeCurrency
              : b.amountInHomeCurrency - a.amountInHomeCurrency
          }
          return 0
        }),
      }))
  }, [sortedExpenses, sortBy, sortOrder])

  // Calculate expense statistics
  const expenseStats = useMemo(() => {
    if (!filteredExpenses.length || !trip)
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        count: 0,
        dailyAverage: 0,
      }

    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amountInHomeCurrency, 0)
    const highest = Math.max(...filteredExpenses.map((expense) => expense.amountInHomeCurrency))
    const lowest = Math.min(...filteredExpenses.map((expense) => expense.amountInHomeCurrency))

    // Calculate days elapsed in trip
    const startDate = new Date(trip.startDate)
    const today = new Date()
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

    return {
      total,
      average: total / filteredExpenses.length,
      highest,
      lowest,
      count: filteredExpenses.length,
      dailyAverage: total / daysElapsed,
    }
  }, [filteredExpenses, trip])

  // Prepare data for category pie chart
  const categoryChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {}

    filteredExpenses.forEach((expense) => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0
      }
      categoryTotals[expense.category] += expense.amountInHomeCurrency
    })

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: getCategoryDetails(category).label,
        value: amount,
        category,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredExpenses])

  // Prepare data for daily expense chart
  const dailyExpenseData = useMemo(() => {
    const dailyTotals: Record<string, number> = {}

    filteredExpenses.forEach((expense) => {
      if (!dailyTotals[expense.date]) {
        dailyTotals[expense.date] = 0
      }
      dailyTotals[expense.date] += expense.amountInHomeCurrency
    })

    return Object.entries(dailyTotals)
      .map(([date, amount]) => ({
        date: format(parseISO(date), "MMM d"),
        amount,
        fullDate: date,
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
  }, [filteredExpenses])

  // Prepare data for fund type breakdown
  const fundTypeData = useMemo(() => {
    const fundTypeTotals: Record<string, number> = {}

    filteredExpenses.forEach((expense) => {
      if (!fundTypeTotals[expense.fundType]) {
        fundTypeTotals[expense.fundType] = 0
      }
      fundTypeTotals[expense.fundType] += expense.amountInHomeCurrency
    })

    return Object.entries(fundTypeTotals).map(([fundType, amount]) => ({
      name: fundType === "budget" ? "Budget" : fundType === "safety" ? "Safety Funds" : "Miscellaneous",
      value: amount,
      fundType,
    }))
  }, [filteredExpenses])

  // Prepare data for category spending trend
  const categoryTrendData = useMemo(() => {
    if (!filteredExpenses.length) return []

    // Get unique dates and categories
    const dates = Array.from(new Set(filteredExpenses.map((e) => e.date))).sort()
    const categories = Array.from(new Set(filteredExpenses.map((e) => e.category)))

    // Create data structure for chart
    return dates.map((date) => {
      const dayExpenses = filteredExpenses.filter((e) => e.date === date)
      const dataPoint: any = {
        date: format(parseISO(date), "MMM d"),
        fullDate: date,
      }

      // Add amount for each category
      categories.forEach((category) => {
        const categoryExpenses = dayExpenses.filter((e) => e.category === category)
        const total = categoryExpenses.reduce((sum, e) => sum + e.amountInHomeCurrency, 0)
        dataPoint[category] = total
      })

      return dataPoint
    })
  }, [filteredExpenses])

  // Handle form submission for adding an expense
  const handleAddExpense = () => {
    if (!trip) return

    // Validate form
    const errors: Record<string, string> = {}
    if (!expenseFormData.name.trim()) errors.name = "Name is required"
    if (expenseFormData.amount <= 0) errors.amount = "Amount must be greater than zero"
    if (!expenseFormData.date) errors.date = "Date is required"

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    // Convert amount to home currency
    const amountInHomeCurrency = convertCurrency(expenseFormData.amount, trip.tripCurrency, trip.homeCurrency)

    // Create expense object
    const newExpense: Omit<Expense, "id" | "tripId" | "createdAt"> = {
      name: expenseFormData.name,
      category: expenseFormData.category,
      date: expenseFormData.date,
      amount: expenseFormData.amount,
      amountInHomeCurrency,
      fundType: expenseFormData.fundType,
      notes: expenseFormData.notes,
    }

    // Add expense
    addExpense(newExpense)
    setIsAddExpenseOpen(false)
  }

  // Handle form submission for editing an expense
  const handleUpdateExpense = () => {
    if (!trip || !selectedExpense) return

    // Validate form
    const errors: Record<string, string> = {}
    if (!expenseFormData.name.trim()) errors.name = "Name is required"
    if (expenseFormData.amount <= 0) errors.amount = "Amount must be greater than zero"
    if (!expenseFormData.date) errors.date = "Date is required"

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    // Convert amount to home currency
    const amountInHomeCurrency = convertCurrency(expenseFormData.amount, trip.tripCurrency, trip.homeCurrency)

    // Create updated expense object
    const updatedExpense: Partial<Expense> = {
      name: expenseFormData.name,
      category: expenseFormData.category,
      date: expenseFormData.date,
      amount: expenseFormData.amount,
      amountInHomeCurrency,
      fundType: expenseFormData.fundType,
      notes: expenseFormData.notes,
    }

    // Update expense
    updateExpenseDetails(selectedExpense.id, updatedExpense)
    setIsEditExpenseOpen(false)
    setSelectedExpense(null)
  }

  // Handle expense deletion
  const handleDeleteExpense = () => {
    if (!selectedExpense) return

    removeExpense(selectedExpense.id)
    setIsDeleteExpenseOpen(false)
    setSelectedExpense(null)
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = parseISO(dateString)
    const today = new Date()
    const yesterday = subDays(today, 1)

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today"
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday"
    } else {
      return format(date, "EEEE, MMMM d, yyyy")
    }
  }

  // Get date range label for display
  const getDateRangeLabel = () => {
    const range = DATE_RANGES.find((r) => r.value === dateRange)
    if (!range) return "Date Range"

    if (dateRange === "custom") {
      return "Custom Range"
    }

    return range.label
  }

  // Loading state
  if (tripLoading || expensesLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 space-y-3">
              <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-lg border p-4 space-y-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state if trip not found
  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Trip Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The trip you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    )
  }

  // Calculate budget status
  const { budgetRemaining, safetyRemaining, status } = calculateFundsStatus(trip)

  // Function to export expenses to CSV
  const exportExpenses = () => {
    if (!filteredExpenses.length || !trip) {
      toast({
        title: "No Expenses to Export",
        description: "There are no expenses to export with the current filters.",
        variant: "default",
      })
      return
    }

    // Create CSV header
    const headers = ["Name", "Category", "Date", "Amount", "Currency", "Notes", "Fund Type"]

    // Create CSV rows
    const rows = filteredExpenses.map((expense) => [
      expense.name,
      expenseCategories.find((cat) => cat.value === expense.category)?.label || expense.category,
      format(parseISO(expense.date), "yyyy-MM-dd"),
      expense.amount.toString(),
      trip.tripCurrency,
      expense.notes || "",
      expense.fundType === "budget" ? "Budget" : expense.fundType === "safety" ? "Safety Funds" : "Miscellaneous",
    ])

    // Combine header and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join("\n")),
    ].join("\n")

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    saveAs(blob, `${trip.name}-expenses-${format(new Date(), "yyyy-MM-dd")}.csv`)

    toast({
      title: "Expenses Exported",
      description: `${filteredExpenses.length} expenses exported to CSV.`,
    })
  }

  // Function to generate PDF report
  const generateReport = () => {
    if (!filteredExpenses.length || !trip) {
      toast({
        title: "No Expenses to Report",
        description: "There are no expenses to generate a report for with the current filters.",
        variant: "default",
      })
      return
    }

    try {
      console.log("Starting PDF generation process...")
      // Create new PDF document
      const doc = new jsPDF()
      console.log("jsPDF instance created.")

      // Watermark settings
      const watermarkText = "Journve"
      const watermarkColor = "#E0E0E0" // Light gray
      const watermarkFontSize = 40

      // Function to add watermark to a page
      const addWatermark = (pdfDoc: jsPDF) => {
        console.log("Attempting to add watermark...")
        const centerX = pdfDoc.internal.pageSize.width / 2
        const centerY = pdfDoc.internal.pageSize.height / 2
        pdfDoc.setFontSize(watermarkFontSize)
        pdfDoc.setTextColor(watermarkColor)
        pdfDoc.text(watermarkText, centerX, centerY, {
          angle: 45, // Rotate 45 degrees
          align: "center",
          baseline: "middle",
        })
        console.log("Watermark added successfully to current page.")
      }

      // Add watermark to the first page
      addWatermark(doc)
      console.log("Initial watermark applied to the first page.")

      // Add title
      doc.setFontSize(18)
      doc.text(`${trip.name} - Expense Report`, 14, 22)
      console.log("Report title added.")

      // Add metadata
      doc.setFontSize(10)
      doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy, h:mm a")}`, 14, 30)
      doc.text(
        `Trip Dates: ${format(parseISO(trip.startDate), "MMM d, yyyy")} - ${format(parseISO(trip.endDate), "MMM d, yyyy")}`,
        14,
        35,
      )
      doc.text(`Currency: ${trip.tripCurrency}`, 14, 40)
      console.log("Metadata added.")

      // Add summary
      doc.setFontSize(14)
      doc.text("Expense Summary", 14, 50)

      doc.setFontSize(10)
      doc.text(`Total Expenses: ${formatCurrency(expenseStats.total, trip.homeCurrency)}`, 14, 58)
      doc.text(`Daily Average: ${formatCurrency(expenseStats.dailyAverage, trip.homeCurrency)}`, 14, 63)
      doc.text(`Number of Expenses: ${expenseStats.count}`, 14, 68)
      console.log("Expense summary added.")

      // Common autoTable styles with didDrawPage hook for watermark on subsequent pages
      const commonTableOptions = {
        theme: "striped",
        headStyles: { fillColor: [244, 114, 182] }, // Pink color for header
        didDrawPage: (data: any) => {
          console.log(`Drawing page ${data.pageNumber}. Checking for watermark...`)
          // Add watermark to every page drawn by autoTable (after the first page)
          if (data.pageNumber > 1) {
            addWatermark(doc)
          }
        },
      }

      // Add category breakdown
      if (categoryChartData.length > 0) {
        console.log("Preparing category breakdown table data...")
        doc.setFontSize(14)
        doc.text("Category Breakdown", 14, 78)

        const categoryTableData = categoryChartData.map((category) => [
          String(getCategoryDetails(category.category).label || category.name),
          String(formatCurrency(category.value, trip.homeCurrency)),
          String(expenseStats.total > 0 ? `${Math.round((category.value / expenseStats.total) * 100)}%` : "0%"),
        ])
        console.log("Category Table Data:", categoryTableData) // Log the data before autoTable
        ;(doc as any).autoTable({
          startY: 82,
          head: [["Category", "Amount", "Percentage"]],
          body: categoryTableData,
          ...commonTableOptions,
        })
        console.log("Category breakdown table added.")
      } else {
        console.log("No category data to display in report.")
      }

      // Add expense list
      const currentY = (doc as any).lastAutoTable?.finalY || 120
      console.log(`Starting expense list table at Y: ${currentY}`)
      doc.setFontSize(14)
      doc.text("Expense List", 14, currentY + 10)

      const expenseTableData = filteredExpenses.map((expense) => [
        String(expense.name),
        String(getCategoryDetails(expense.category).label || expense.category),
        String(format(parseISO(expense.date), "MMM d, yyyy")),
        String(formatCurrency(expense.amount, trip.tripCurrency)),
        String(expense.fundType === "budget" ? "Budget" : expense.fundType === "safety" ? "Safety" : "Misc"),
      ])
      console.log("Expense Table Data:", expenseTableData) // Log the data before autoTable
      ;(doc as any).autoTable({
        startY: currentY + 14,
        head: [["Name", "Category", "Date", "Amount", "Fund Type"]],
        body: expenseTableData,
        ...commonTableOptions,
      })
      console.log("Expense list table added.")

      // Save the PDF
      doc.save(`${trip.name}-expense-report-${format(new Date(), "yyyy-MM-dd")}.pdf`)
      console.log("PDF saved successfully.")

      toast({
        title: "Report Generated",
        description: "Expense report has been generated and downloaded.",
      })
    } catch (error: any) {
      console.error("Error generating PDF report:", error)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      console.error("Full error object:", error) // Log the entire error object for more details
      toast({
        title: "Error Generating Report",
        description: "There was an issue generating the expense report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 h-fit">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center">
            <Wallet className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
            Expense Tracker
            <Badge className="ml-2 sm:ml-3 text-xs sm:text-sm" variant="outline">
              {trip.name}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Track and manage your expenses for this trip</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddExpenseOpen(true)} className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {isMobile ? "Add" : "Add Expense"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportExpenses()}>
                <Download className="mr-2 h-4 w-4" />
                Export Expenses
              </DropdownMenuItem>
              {/* Removed Generate Report option */}
              <DropdownMenuItem onClick={() => setShowConversion(!showConversion)}>
                {showConversion ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide Conversions
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Conversions
                  </>
                )}
              </DropdownMenuItem>
              {/* Removed Refresh Data option from here */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background border-pink-100 dark:border-pink-900/20">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center text-pink-700 dark:text-pink-300">
              <DollarSign className="mr-2 h-4 w-4" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-600 dark:text-pink-400">
              {formatCurrency(expenseStats.total, trip.homeCurrency)}
            </div>
            <p className="text-xs sm:text-sm text-pink-600/70 dark:text-pink-400/70 mt-1">
              {expenseStats.count} {expenseStats.count === 1 ? "expense" : "expenses"} recorded
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-100 dark:border-blue-900/20">
          <CardHeader className="pb-2 px-4 pt-4 flex flex-row items-center justify-between">
            {" "}
            {/* Modified for button */}
            <CardTitle className="text-sm font-medium flex items-center text-blue-700 dark:text-blue-300">
              <Wallet className="mr-2 h-4 w-4" />
              Remaining Budget
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshTrip} // Call refreshTrip on click
              className="h-7 w-7 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              aria-label="Refresh Budget"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(budgetRemaining, trip.homeCurrency)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress
                value={(budgetRemaining / trip.budget) * 100}
                className="h-2"
                indicatorClassName={
                  budgetRemaining / trip.budget <= 0.1
                    ? "bg-red-500"
                    : budgetRemaining / trip.budget <= 0.25
                      ? "bg-amber-500"
                      : "bg-green-500"
                }
              />
              <span className="text-xs text-blue-600/70 dark:text-blue-400/70 whitespace-nowrap">
                {Math.round((budgetRemaining / trip.budget) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-100 dark:border-green-900/20 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center text-green-700 dark:text-green-300">
              <TrendingUp className="mr-2 h-4 w-4" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(expenseStats.dailyAverage, trip.homeCurrency)}
            </div>
            <p className="text-xs sm:text-sm text-green-600/70 dark:text-green-400/70 mt-1">Per day spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {status === "safety" && (
        <Alert className="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Budget Exceeded</AlertTitle>
          <AlertDescription>
            Your budget has been depleted. Expenses are now being deducted from your safety funds.
          </AlertDescription>
        </Alert>
      )}

      {status === "depleted" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>All Funds Depleted</AlertTitle>
          <AlertDescription>
            Your budget and safety funds have all been depleted. Consider adding more funds or reducing expenses.
          </AlertDescription>
        </Alert>
      )}

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center text-xs sm:text-sm">
            <FileText className={`${isMobile ? "mr-0" : "mr-2"} h-4 w-4`} />
            {isMobile ? "" : "Expenses"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center text-xs sm:text-sm">
            <BarChart3 className={`${isMobile ? "mr-0" : "mr-2"} h-4 w-4`} />
            {isMobile ? "" : "Analytics"}
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center text-xs sm:text-sm">
            <Wallet className={`${isMobile ? "mr-0" : "mr-2"} h-4 w-4`} />
            {isMobile ? "" : "Budget"}
          </TabsTrigger>
        </TabsList>

        {/* Expenses List View */}
        <TabsContent value="list" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search expenses..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    {isMobile ? "" : "Filters"}
                    {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>

                  {/* Improved Date Range Selector with Popover for better mobile experience */}
                  <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center bg-transparent">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {isMobile ? "" : getDateRangeLabel()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" className="w-[280px] p-0 sm:w-[320px]">
                      <div className="p-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {DATE_RANGES.map((range) => (
                            <Button
                              key={range.value}
                              variant={dateRange === range.value ? "default" : "ghost"}
                              size="sm"
                              className="justify-start"
                              onClick={() => {
                                setDateRange(range.value)
                                if (range.value !== "custom") {
                                  setIsDatePopoverOpen(false)
                                }
                              }}
                            >
                              {range.label}
                            </Button>
                          ))}
                        </div>
                        {dateRange === "custom" && (
                          <div className="mt-2 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="start-date" className="text-xs">
                                  Start Date
                                </Label>
                                <Input
                                  id="start-date"
                                  type="date"
                                  value={customDateRange.startDate}
                                  onChange={(e) =>
                                    setCustomDateRange({
                                      ...customDateRange,
                                      startDate: e.target.value,
                                    })
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label htmlFor="end-date" className="text-xs">
                                  End Date
                                </Label>
                                <Input
                                  id="end-date"
                                  type="date"
                                  value={customDateRange.endDate}
                                  onChange={(e) =>
                                    setCustomDateRange({
                                      ...customDateRange,
                                      endDate: e.target.value,
                                    })
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                            <Button size="sm" className="w-full" onClick={() => setIsDatePopoverOpen(false)}>
                              Apply Custom Range
                            </Button>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        {isMobile ? "" : "Sort"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setSortBy("date")}
                        className={sortBy === "date" ? "bg-muted" : ""}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Date
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortBy("amount")}
                        className={sortBy === "amount" ? "bg-muted" : ""}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Amount
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortBy("category")}
                        className={sortBy === "category" ? "bg-muted" : ""}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Category
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                        {sortOrder === "asc" ? (
                          <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Ascending
                          </>
                        ) : (
                          <>
                            <TrendingDown className="mr-2 h-4 w-4" />
                            Descending
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="category-filter" className="mb-2 block">
                          Category
                        </Label>
                        <Select
                          value={categoryFilter || "all"}
                          onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
                        >
                          <SelectTrigger id="category-filter">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {expenseCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center">
                                  <span className="mr-2">{category.icon}</span>
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fund-type-filter" className="mb-2 block">
                          Fund Type
                        </Label>
                        <Select
                          value={fundTypeFilter || "all"}
                          onValueChange={(value) => setFundTypeFilter(value === "all" ? null : value)}
                        >
                          <SelectTrigger id="fund-type-filter">
                            <SelectValue placeholder="All Fund Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Fund Types</SelectItem>
                            <SelectItem value="budget">
                              <div className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4 text-primary" />
                                Budget
                              </div>
                            </SelectItem>
                            <SelectItem value="safety">
                              <div className="flex items-center">
                                <Shield className="mr-2 h-4 w-4 text-amber-500" />
                                Safety Funds
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCategoryFilter(null)
                          setFundTypeFilter(null)
                          setDateRange("month")
                          setSearchQuery("")
                          setSortBy("date")
                          setSortOrder("desc")
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Active Filters */}
          {(categoryFilter || fundTypeFilter || dateRange !== "month" || searchQuery) && (
            <div className="flex flex-wrap gap-2">
              {categoryFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {getCategoryDetails(categoryFilter).label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setCategoryFilter(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {fundTypeFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {fundTypeFilter === "budget" ? <CreditCard className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  {fundTypeFilter === "budget" ? "Budget" : "Safety Funds"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setFundTypeFilter(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {dateRange !== "month" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {DATE_RANGES.find((r) => r.value === dateRange)?.label || "Custom Date Range"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setDateRange("month")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Search: {searchQuery}
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}

          {/* Expenses List */}
          <Card className="">
            {" "}
            {/* Removed overflow-hidden here */}
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle>Expenses</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? "expense" : "expenses"} • Total:{" "}
                  {formatCurrency(expenseStats.total, trip.homeCurrency)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="">
              {filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No expenses found</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCategoryFilter(null)
                      setFundTypeFilter(null)
                      setDateRange("month")
                      setSearchQuery("")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {expensesByDate.map(({ date, expenses }) => (
                    <div key={date} className="space-y-3">
                      <div className="sticky top-0 bg-background z-10 py-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-pink-500" />
                            <h3 className="text-xs sm:text-sm font-medium">{formatDateForDisplay(date)}</h3>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(
                              expenses.reduce((total, expense) => total + expense.amountInHomeCurrency, 0),
                              trip.homeCurrency,
                            )}
                          </Badge>
                        </div>
                        <Separator className="mt-1" />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        {expenses.map((expense) => (
                          <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="p-3 sm:p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-2 sm:gap-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                                      {getCategoryDetails(expense.category).icon}
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm sm:text-base truncate">{expense.name}</h4>
                                    <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground mt-1 gap-1 sm:gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {getCategoryDetails(expense.category).label}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          expense.fundType === "budget" ? "text-primary" : "text-amber-500",
                                          "text-xs",
                                        )}
                                      >
                                        {expense.fundType === "budget" ? "Budget" : "Safety"}
                                      </Badge>
                                    </div>
                                    {expense.notes && (
                                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {expense.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-2 flex-shrink-0">
                                  <div className="font-medium text-sm sm:text-base">
                                    {formatCurrency(expense.amount, trip.tripCurrency)}
                                  </div>
                                  {trip.tripCurrency !== trip.homeCurrency && showConversion && (
                                    <div className="text-xs text-muted-foreground">
                                      {formatCurrency(expense.amountInHomeCurrency, trip.homeCurrency)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-3 sm:mt-4">
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {format(parseISO(expense.createdAt), "h:mm a")}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedExpense(expense)
                                      setIsEditExpenseOpen(true)
                                    }}
                                    className="h-7 w-7 sm:h-8 sm:w-8"
                                  >
                                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedExpense(expense)
                                      setIsDeleteExpenseOpen(true)
                                    }}
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Date Range Selector */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-medium">Expense Analytics</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Visualize your spending patterns and trends
                  </p>
                </div>

                {/* Responsive Date Range Selector */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {getDateRangeLabel()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0 sm:w-[320px]">
                    <div className="p-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {DATE_RANGES.map((range) => (
                          <Button
                            key={range.value}
                            variant={dateRange === range.value ? "default" : "ghost"}
                            size="sm"
                            className="justify-start"
                            onClick={() => setDateRange(range.value)}
                          >
                            {range.label}
                          </Button>
                        ))}
                      </div>
                      {dateRange === "custom" && (
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="analytics-start-date" className="text-xs">
                                Start Date
                              </Label>
                              <Input
                                id="analytics-start-date"
                                type="date"
                                value={customDateRange.startDate}
                                onChange={(e) =>
                                  setCustomDateRange({
                                    ...customDateRange,
                                    startDate: e.target.value,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                            <div>
                              <Label htmlFor="analytics-end-date" className="text-xs">
                                End Date
                              </Label>
                              <Input
                                id="analytics-end-date"
                                type="date"
                                value={customDateRange.endDate}
                                onChange={(e) =>
                                  setCustomDateRange({
                                    ...customDateRange,
                                    endDate: e.target.value,
                                  })
                                }
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <PieChartIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Category Distribution
                </CardTitle>
                <CardDescription>Breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryChartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] sm:h-[250px] md:h-[300px] text-center">
                    <PieChartIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No data to display</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={isMobile ? 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              isMobile ? `${(percent * 100).toFixed(0)}%` : `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          {!isMobile && <Legend />}
                          <ChartTooltip
                            formatter={(value) => [`${formatCurrency(value as number, trip.homeCurrency)}`, "Amount"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <Separator className="my-3 sm:my-4" />

                    <div className="space-y-2">
                      {categoryChartData.slice(0, 3).map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="h-3 w-3 rounded-full mr-2"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-xs sm:text-sm">{category.name}</span>
                          </div>
                          <div className="font-medium text-xs sm:text-sm">
                            {formatCurrency(category.value, trip.homeCurrency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Daily Spending Trend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Daily Spending Trend
                </CardTitle>
                <CardDescription>How your expenses vary over time</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyExpenseData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] sm:h-[250px] md:h-[300px] text-center">
                    <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No data to display</p>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailyExpenseData}
                        margin={{
                          top: 5,
                          right: isMobile ? 5 : 30,
                          left: isMobile ? 5 : 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12 }} tickMargin={isMobile ? 5 : 10} />
                        <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                        <ChartTooltip
                          formatter={(value) => [`${formatCurrency(value as number, trip.homeCurrency)}`, "Amount"]}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#FF5A5F" fill="#FF5A5F" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Spending Trend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Category Spending Trend
                </CardTitle>
                <CardDescription>How spending varies by category over time</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryTrendData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] sm:h-[250px] md:h-[300px] text-center">
                    <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No data to display</p>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={categoryTrendData}
                        margin={{
                          top: 5,
                          right: isMobile ? 5 : 30,
                          left: isMobile ? 5 : 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12 }} tickMargin={isMobile ? 5 : 10} />
                        <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} width={isMobile ? 30 : 40} />
                        <ChartTooltip
                          formatter={(value) => [`${formatCurrency(value as number, trip.homeCurrency)}`, "Amount"]}
                        />
                        <Legend iconSize={isMobile ? 8 : 10} wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                        {expenseCategories.map((category, index) => {
                          // Only show categories that have data
                          if (categoryTrendData.some((d) => d[category.value] > 0)) {
                            return (
                              <Line
                                key={category.value}
                                type="monotone"
                                dataKey={category.value}
                                name={category.label}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                activeDot={{ r: isMobile ? 6 : 8 }}
                                strokeWidth={isMobile ? 1 : 2}
                              />
                            )
                          }
                          return null
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base smm:text-lg flex items-center">
                  <Info className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Expense Statistics
                </CardTitle>
                <CardDescription>Key metrics about your spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Expenses</div>
                      <div className="text-lg sm:text-2xl font-bold mt-1">
                        {formatCurrency(expenseStats.total, trip.homeCurrency)}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-muted-foreground">Average Expense</div>
                      <div className="text-lg sm:text-2xl font-bold mt-1">
                        {formatCurrency(expenseStats.average, trip.homeCurrency)}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-muted-foreground">Highest Expense</div>
                      <div className="text-lg sm:text-2xl font-bold mt-1">
                        {formatCurrency(expenseStats.highest, trip.homeCurrency)}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Count</div>
                      <div className="text-lg sm:text-2xl font-bold mt-1">{expenseStats.count} expenses</div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="insights">
                      <AccordionTrigger className="text-sm font-medium">
                        <Info className="mr-2 h-4 w-4" />
                        Spending Insights
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-xs sm:text-sm">
                          {expenseStats.count > 0 ? (
                            <>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Top Category
                                </Badge>
                                <span>{categoryChartData.length > 0 ? categoryChartData[0].name : "N/A"}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Highest Spending Day
                                </Badge>
                                <span>
                                  {dailyExpenseData.length > 0
                                    ? dailyExpenseData.sort((a, b) => b.amount - a.amount)[0].date
                                    : "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Budget Impact
                                </Badge>
                                <span>
                                  {Math.round((expenseStats.total / trip.budget) * 100)}% of total budget used
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No expense data available for insights</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget View */}
        <TabsContent value="budget" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Budget Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <Wallet className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Budget Overview
                </CardTitle>
                <CardDescription>Track your budget and spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Total Budget:</span>
                      <span className="font-medium">{formatCurrency(trip.budget, trip.homeCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Total Spent:</span>
                      <span className="font-medium">{formatCurrency(expenseStats.total, trip.homeCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Remaining Budget:</span>
                      <span className="font-medium">{formatCurrency(budgetRemaining, trip.homeCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Safety Funds:</span>
                      <span className="font-medium">{formatCurrency(trip.safetyFunds, trip.homeCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span>Safety Funds Remaining:</span>
                      <span className="font-medium">{formatCurrency(safetyRemaining, trip.homeCurrency)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span>Budget Usage:</span>
                        <span>{Math.round((1 - budgetRemaining / trip.budget) * 100)}%</span>
                      </div>
                      <Progress
                        value={(1 - budgetRemaining / trip.budget) * 100}
                        className="h-2 sm:h-3"
                        indicatorClassName={
                          budgetRemaining / trip.budget <= 0.1
                            ? "bg-red-500"
                            : budgetRemaining / trip.budget <= 0.25
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span>Safety Funds Usage:</span>
                        <span>{Math.round((1 - safetyRemaining / (trip.safetyFunds || 1)) * 100)}%</span>
                      </div>
                      <Progress
                        value={(1 - safetyRemaining / (trip.safetyFunds || 1)) * 100}
                        className="h-2 sm:h-3"
                        indicatorClassName={
                          safetyRemaining / (trip.safetyFunds || 1) <= 0.1
                            ? "bg-red-500"
                            : safetyRemaining / (trip.safetyFunds || 1) <= 0.25
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }
                      />
                    </div>
                  </div>

                  {status === "safety" && (
                    <Alert className="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Budget Exceeded</AlertTitle>
                      <AlertDescription>
                        Your budget has been depleted. Expenses are now being deducted from your safety funds.
                      </AlertDescription>
                    </Alert>
                  )}

                  {status === "depleted" && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>All Funds Depleted</AlertTitle>
                      <AlertDescription>
                        Your budget and safety funds have all been depleted. Consider adding more funds or reducing
                        expenses.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Fund Type Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <PieChartIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Fund Type Distribution
                </CardTitle>
                <CardDescription>How expenses are distributed across fund types</CardDescription>
              </CardHeader>
              <CardContent>
                {fundTypeData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] sm:h-[250px] md:h-[300px] text-center">
                    <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No data to display</p>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fundTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isMobile ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            isMobile ? `${(percent * 100).toFixed(0)}%` : `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {fundTypeData.map((entry) => (
                            <Cell
                              key={`cell-${entry.fundType}`}
                              fill={entry.fundType === "budget" ? "#7C5DFA" : "#FFB74D"}
                            />
                          ))}
                        </Pie>
                        {!isMobile && <Legend />}
                        <ChartTooltip
                          formatter={(value) => [`${formatCurrency(value as number, trip.homeCurrency)}`, "Amount"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget Recommendations */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <Info className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                  Budget Recommendations
                </CardTitle>
                <CardDescription>Smart suggestions to help you stay on budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseStats.count > 0 ? (
                    <>
                      <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center text-sm sm:text-base">
                          <TrendingUp className="mr-2 h-4 w-4 text-pink-500" />
                          Daily Spending Limit
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          Based on your remaining budget and trip duration, we recommend limiting your daily spending
                          to:
                        </p>
                        <div className="text-lg sm:text-xl font-bold text-pink-600 dark:text-pink-400">
                          {formatCurrency(
                            budgetRemaining /
                              Math.max(
                                1,
                                Math.ceil(
                                  (new Date(trip.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                                ),
                              ),
                            trip.homeCurrency,
                          )}
                        </div>
                      </div>

                      <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center text-sm sm:text-base">
                          <Tag className="mr-2 h-4 w-4 text-pink-500" />
                          Top Spending Category
                        </h4>
                        {categoryChartData.length > 0 ? (
                          <>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                              Your highest spending category is <strong>{categoryChartData[0].name}</strong> at{" "}
                              {formatCurrency(categoryChartData[0].value, trip.homeCurrency)}. Consider setting a limit
                              for this category.
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[0] }}></div>
                              <div className="text-xs sm:text-sm">
                                {Math.round((categoryChartData[0].value / expenseStats.total) * 100)}% of total expenses
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs sm:text-sm text-muted-foreground">No category data available</p>
                        )}
                      </div>

                      <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center text-sm sm:text-base">
                          <AlertTriangle className="mr-2 h-4 w-4 text-pink-500" />
                          Budget Alert
                        </h4>
                        {budgetRemaining / trip.budget < 0.3 ? (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            You have less than 30% of your budget remaining. Consider reducing spending on non-essential
                            items.
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Your budget is on track. Keep monitoring your expenses to stay within your limits.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                      <Info className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No expense data available for recommendations. Start tracking your expenses to get personalized
                        budget insights.
                      </p>
                      <Button onClick={() => setIsAddExpenseOpen(true)} className="bg-pink-500 hover:bg-pink-600">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Expense
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Add a new expense to {trip.name}</DialogDescription>
          </DialogHeader>
          <ExpenseForm
            isEdit={false}
            onSubmit={handleAddExpense}
            onCancel={() => setIsAddExpenseOpen(false)}
            expenseData={expenseFormData}
            setExpenseData={setExpenseFormData}
            selectedTrip={trip}
            formErrors={formErrors}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update expense details</DialogDescription>
          </DialogHeader>
          <ExpenseForm
            isEdit={true}
            onSubmit={handleUpdateExpense}
            onCancel={() => {
              setIsEditExpenseOpen(false)
              setSelectedExpense(null)
            }}
            expenseData={expenseFormData}
            setExpenseData={setExpenseFormData}
            selectedTrip={trip}
            formErrors={formErrors}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteExpenseOpen} onOpenChange={setIsDeleteExpenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-lg bg-muted/30 mt-2">
            {selectedExpense && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedExpense.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryDetails(selectedExpense.category).label} •{" "}
                    {format(parseISO(selectedExpense.date), "MMM d, yyyy")}
                  </p>
                </div>
                <p className="font-bold">{formatCurrency(selectedExpense.amount, trip.tripCurrency)}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteExpenseOpen(false)
                setSelectedExpense(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExpense} className="w-full sm:w-auto">
              Delete Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
