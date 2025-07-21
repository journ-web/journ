"use client"

import { useState, useEffect, useMemo } from "react"
import { format, addDays, parseISO, isToday, isYesterday, differenceInDays, isSameWeek } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  MapPin,
  CalendarIcon,
  Users,
  Briefcase,
  CreditCard,
  Wallet,
  Shield,
  Globe,
  Clock,
  ArrowRight,
  Search,
  X,
  Edit,
  AlertTriangle,
  Utensils,
  Home,
  ShoppingBag,
  Ticket,
  Heart,
  Sparkles,
  BarChart3,
  Receipt,
  Plane,
  PieChartIcon,
  Layers,
  CheckCircle,
  Calendar,
  TrendingDown,
  TrendingUp,
  Info,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { useExchangeRates } from "@/utils/exchange-rates"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import type { Trip, Task, TripType, Expense, ExpenseCategory, FundType } from "@/types/trip"
import { formatCurrency, getExchangeRate } from "@/utils/currency"
import { calculateFundsStatus, getTripDates } from "@/utils/trip-utils"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useTrips, useTripDetails } from "@/hooks/use-trips"
import { useTasks } from "@/hooks/use-tasks"
import { useExpenses } from "@/hooks/use-expenses"
import { useToast } from "@/hooks/use-toast"
// Add the import for the CurrencySelector component
import { SimpleCurrencySelector } from "@/components/simple-currency-selector"
// Import the ImageCarousel component at the top of the file:
import { ImageCarousel } from "./image-carousel"
// Update the import for the ExpenseTracker component to ensure it's properly imported:
import { ExpenseTracker } from "@/components/dashboard/expense-tracker/expense-tracker"

const expenseCategories = [
  { value: "accommodation", label: "Accommodation", icon: <Home className="h-4 w-4" /> },
  { value: "food", label: "Food & Drinks", icon: <Utensils className="h-4 w-4" /> },
  { value: "transportation", label: "Transportation", icon: <Plane className="h-4 w-4" /> },
  { value: "activities", label: "Activities & Tours", icon: <Ticket className="h-4 w-4" /> },
  { value: "shopping", label: "Shopping", icon: <ShoppingBag className="h-4 w-4" /> },
  { value: "entertainment", label: "Entertainment", icon: <Sparkles className="h-4 w-4" /> },
  { value: "health", label: "Health & Medical", icon: <Heart className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <Briefcase className="h-4 w-4" /> },
]

export function TripPlanner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripId = searchParams.get("id")
  const { user } = useAuth()
  const { toast } = useToast()

  // Use custom hooks for data fetching
  const { trips, loading: tripsLoading, addTrip, updateTripStatus, removeTrip } = useTrips()
  const { trip: selectedTrip, loading: tripLoading, updateTripDetails } = useTripDetails(tripId)
  const { tasks, addTask, toggleTaskCompletion, removeTask } = useTasks(tripId)
  const { expenses, addExpense, updateExpenseDetails, removeExpense } = useExpenses(tripId)

  const [activeTab, setActiveTab] = useState("planned")
  const [isAddTripOpen, setIsAddTripOpen] = useState(false)
  const [isEditTripOpen, setIsEditTripOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isDeleteTripOpen, setIsDeleteTripOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [searchExpenseQuery, setSearchExpenseQuery] = useState("")
  const [activeTimeFilter, setActiveTimeFilter] = useState<"all" | "today" | "yesterday" | "week">("all")
  const [activeSection, setActiveSection] = useState<"overview" | "tasks" | "expenses">("overview")

  // New trip form state
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    tripType: "solo" as TripType,
    people: 1,
    budget: 0,
    safetyFunds: 0,
    homeCurrency: "USD",
    tripCurrency: "USD",
  })

  // Add validation state after the newTrip state
  const [tripFormErrors, setTripFormErrors] = useState<Record<string, string>>({})

  // New task form state
  const [newTask, setNewTask] = useState({
    name: "",
    notes: "",
    location: "",
    time: "",
    budgetCost: 0,
    date: format(new Date(), "yyyy-MM-dd"),
  })

  // Add task form validation state
  const [taskFormErrors, setTaskFormErrors] = useState<Record<string, string>>({})

  // Inside the TripPlanner component, update the state management
  // Replace the newExpense state with:
  const [expenseData, setExpenseData] = useState({
    name: "",
    category: "food" as ExpenseCategory,
    date: format(new Date(), "yyyy-MM-dd"),
    amount: 0,
    notes: "",
    fundType: "budget" as FundType,
  })

  // Add expense form validation state
  const [expenseFormErrors, setExpenseFormErrors] = useState<Record<string, string>>({})

  // Add state variables for expense management
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false)
  const [isDeleteExpenseOpen, setIsDeleteExpenseOpen] = useState(false)

  // Use the shared exchange rates hook
  const {
    rates: exchangeRates,
    lastUpdated,
    isLoading: isLoadingRates,
    error: ratesError,
    convertCurrency,
    refreshExchangeRates,
    canRefreshRates,
  } = useExchangeRates()

  // Set selected trip based on URL param
  useEffect(() => {
    if (tripId && selectedTrip) {
      setSelectedDate(format(new Date(selectedTrip.startDate), "yyyy-MM-dd"))

      // Set active tab based on trip status
      if (selectedTrip.status === "planned") {
        setActiveTab("planned")
      } else if (selectedTrip.status === "ongoing") {
        setActiveTab("ongoing")
      } else {
        setActiveTab("completed")
      }
    }
  }, [tripId, selectedTrip])

  // Update the handleAddTrip function to include validation
  const handleAddTrip = async () => {
    // Validate form fields
    const errors: Record<string, string> = {}

    if (!newTrip.name.trim()) errors.name = "Trip name is required"
    if (!newTrip.destination.trim()) errors.destination = "Destination is required"
    if (!newTrip.startDate) errors.startDate = "Start date is required"
    if (!newTrip.endDate) errors.endDate = "End date is required"
    if (new Date(newTrip.endDate) < new Date(newTrip.startDate)) {
      errors.endDate = "End date must be after start date"
    }
    if (!newTrip.tripType) errors.tripType = "Trip type is required"
    if (newTrip.people <= 0) errors.people = "Number of people must be at least 1"
    if (!newTrip.homeCurrency) errors.homeCurrency = "Home currency is required"
    if (!newTrip.tripCurrency) errors.tripCurrency = "Trip currency is required"
    if (newTrip.budget < 0) errors.budget = "Budget cannot be negative"
    if (newTrip.safetyFunds < 0) errors.safetyFunds = "Safety funds cannot be negative"

    setTripFormErrors(errors)

    // If there are errors, don't proceed
    if (Object.keys(errors).length > 0) return

    const exchangeRate = getExchangeRate(newTrip.homeCurrency, newTrip.tripCurrency)

    const tripData: Omit<Trip, "id" | "tasks" | "expenses"> = {
      name: newTrip.name,
      destination: newTrip.destination,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      tripType: newTrip.tripType,
      people: newTrip.people,
      budget: newTrip.budget,
      miscellaneousFunds: 0,
      safetyFunds: newTrip.safetyFunds,
      status: "planned",
      homeCurrency: newTrip.homeCurrency,
      tripCurrency: newTrip.tripCurrency,
      exchangeRate,
    }

    const result = await addTrip(tripData)
    if (result) {
      resetTripForm()
      setIsAddTripOpen(false)
      toast({
        title: "Trip Created",
        description: `${newTrip.name} has been added to your trips.`,
      })
    }
  }

  // Update the handleEditTrip function to include validation
  const handleEditTrip = async () => {
    if (!selectedTrip) return

    // Validate form fields
    const errors: Record<string, string> = {}

    if (!newTrip.name.trim()) errors.name = "Trip name is required"
    if (!newTrip.destination.trim()) errors.destination = "Destination is required"
    if (!newTrip.startDate) errors.startDate = "Start date is required"
    if (!newTrip.endDate) errors.endDate = "End date must be after start date"
    if (new Date(newTrip.endDate) < new Date(newTrip.startDate)) {
      errors.endDate = "End date must be after start date"
    }
    if (!newTrip.tripType) errors.tripType = "Trip type is required"
    if (newTrip.people <= 0) errors.people = "Number of people must be at least 1"
    if (!newTrip.homeCurrency) errors.homeCurrency = "Home currency is required"
    if (!newTrip.tripCurrency) errors.tripCurrency = "Trip currency is required"
    if (newTrip.budget < 0) errors.budget = "Budget cannot be negative"
    if (newTrip.safetyFunds < 0) errors.safetyFunds = "Safety funds cannot be negative"

    setTripFormErrors(errors)

    // If there are errors, don't proceed
    if (Object.keys(errors).length > 0) return

    const exchangeRate = getExchangeRate(newTrip.homeCurrency, newTrip.tripCurrency)

    const tripData: Partial<Trip> = {
      name: newTrip.name,
      destination: newTrip.destination,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      tripType: newTrip.tripType,
      people: newTrip.people,
      budget: newTrip.budget,
      miscellaneousFunds: 0,
      safetyFunds: newTrip.safetyFunds,
      homeCurrency: newTrip.homeCurrency,
      tripCurrency: newTrip.tripCurrency,
      exchangeRate,
    }

    const success = await updateTripDetails(tripData)
    if (success) {
      resetTripForm()
      setIsEditTripOpen(false)
      toast({
        title: "Trip Updated",
        description: `${newTrip.name} has been updated successfully.`,
      })
    }
  }

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return

    const success = await removeTrip(selectedTrip.id)
    if (success) {
      setIsDeleteTripOpen(false)
      router.push("/dashboard/trips")
      toast({
        title: "Trip Deleted",
        description: `${selectedTrip.name} has been deleted.`,
        variant: "destructive",
      })
    }
  }

  const handleStartTrip = async (tripId: string) => {
    const success = await updateTripStatus(tripId, "ongoing")
    if (success && selectedTrip) {
      toast({
        title: "Trip Started",
        description: `${selectedTrip.name} has been marked as ongoing.`,
      })
    }
  }

  const handleCancelTrip = async (tripId: string) => {
    const success = await updateTripStatus(tripId, "cancelled")
    if (success && selectedTrip) {
      toast({
        title: "Trip Cancelled",
        description: `${selectedTrip.name} has been cancelled.`,
        variant: "destructive",
      })
    }
  }

  const handleCompleteTrip = async (tripId: string) => {
    const success = await updateTripStatus(tripId, "completed")
    if (success && selectedTrip) {
      toast({
        title: "Trip Completed",
        description: `${selectedTrip.name} has been marked as completed.`,
      })
    }
  }

  // Update the handleAddTask function to include validation
  const handleAddTask = async () => {
    if (!selectedTrip || !selectedDate) return

    // Validate form fields
    const errors: Record<string, string> = {}

    if (!newTask.name.trim()) errors.name = "Task name is required"
    if (newTask.budgetCost < 0) errors.budgetCost = "Budget cost cannot be negative"

    setTaskFormErrors(errors)

    // If there are errors, don't proceed
    if (Object.keys(errors).length > 0) return

    const taskData: Omit<Task, "id" | "completed"> = {
      name: newTask.name,
      notes: newTask.notes,
      location: newTask.location,
      time: newTask.time,
      budgetCost: newTask.budgetCost,
      date: selectedDate,
    }

    const result = await addTask(taskData)

    if (result) {
      resetTaskForm()
      setIsAddTaskOpen(false)
      toast({
        title: "Task Added",
        description: `${newTask.name} has been added to your itinerary.`,
      })
    }
  }

  const handleToggleTaskCompletion = async (date: string, taskId: string, completed: boolean) => {
    const success = await toggleTaskCompletion(date, taskId, !completed)
    if (success) {
      toast({
        title: completed ? "Task Marked as Incomplete" : "Task Completed",
        description: completed ? "Task has been marked as incomplete." : "Task has been marked as complete.",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const success = await removeTask(taskId)
    if (success) {
      toast({
        title: "Task Deleted",
        description: "Task has been removed from your itinerary.",
        variant: "destructive",
      })
    }
  }

  // Update the resetTripForm function to also reset errors
  const resetTripForm = () => {
    setNewTrip({
      name: "",
      destination: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      tripType: "solo",
      people: 1,
      budget: 0,
      safetyFunds: 0,
      homeCurrency: "USD",
      tripCurrency: "USD",
    })
    setTripFormErrors({})
  }

  const resetTaskForm = () => {
    setNewTask({
      name: "",
      notes: "",
      location: "",
      time: "",
      budgetCost: 0,
      date: format(new Date(), "yyyy-MM-dd"),
    })
    setTaskFormErrors({})
  }

  // Replace the resetExpenseForm function with:
  const resetExpenseForm = () => {
    setExpenseData({
      name: "",
      category: "food" as ExpenseCategory,
      date: format(new Date(), "yyyy-MM-dd"),
      amount: 0,
      notes: "",
      fundType: "budget" as FundType,
    })
    setExpenseFormErrors({})
  }

  const populateEditForm = (trip: Trip) => {
    setNewTrip({
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      tripType: trip.tripType,
      people: trip.people,
      budget: trip.budget,
      safetyFunds: trip.safetyFunds,
      homeCurrency: trip.homeCurrency,
      tripCurrency: trip.tripCurrency,
    })
    setTripFormErrors({})
  }

  // Replace the populateExpenseEditForm function with:
  const populateExpenseEditForm = (expense: Expense) => {
    setExpenseData({
      name: expense.name,
      category: expense.category,
      date: expense.date,
      amount: expense.amount,
      notes: expense.notes || "",
      fundType: expense.fundType,
    })
    setExpenseFormErrors({})
  }

  // Update the handleAddExpense function to include validation:
  const handleAddExpense = async () => {
    if (!selectedTrip) return

    // Validate form fields
    const errors: Record<string, string> = {}

    if (!expenseData.name.trim()) errors.name = "Expense name is required"
    if (!expenseData.category) errors.category = "Category is required"
    if (!expenseData.date) errors.date = "Date is required"
    if (expenseData.amount <= 0) errors.amount = "Amount must be greater than zero"
    if (!expenseData.fundType) errors.fundType = "Fund type is required"

    setExpenseFormErrors(errors)

    // If there are errors, don't proceed
    if (Object.keys(errors).length > 0) return

    // Use the shared convertCurrency function to convert from trip currency to home currency
    const amountInHomeCurrency = convertCurrency(
      expenseData.amount,
      selectedTrip.tripCurrency,
      selectedTrip.homeCurrency,
    )

    const expenseDataToAdd: Omit<Expense, "id" | "tripId" | "createdAt"> = {
      name: expenseData.name,
      category: expenseData.category,
      date: expenseData.date,
      amount: expenseData.amount, // Original amount in trip currency
      amountInHomeCurrency, // Converted amount in home currency
      fundType: expenseData.fundType,
      notes: expenseData.notes,
    }

    const result = await addExpense(expenseDataToAdd)

    if (result) {
      resetExpenseForm()
      setIsAddExpenseOpen(false)
      toast({
        title: "Expense Added",
        description: `${expenseData.name} has been added to your expenses.`,
      })
    }
  }

  // Update the handleUpdateExpense function to include validation:
  const handleUpdateExpense = async () => {
    if (!selectedTrip || !selectedExpense) return

    // Validate form fields
    const errors: Record<string, string> = {}

    if (!expenseData.name.trim()) errors.name = "Expense name is required"
    if (!expenseData.category) errors.category = "Category is required"
    if (!expenseData.date) errors.date = "Date is required"
    if (expenseData.amount <= 0) errors.amount = "Amount must be greater than zero"
    if (!expenseData.fundType) errors.fundType = "Fund type is required"

    setExpenseFormErrors(errors)

    // If there are errors, don't proceed
    if (Object.keys(errors).length > 0) return

    // Use the shared convertCurrency function to convert from trip currency to home currency
    const amountInHomeCurrency = convertCurrency(
      expenseData.amount,
      selectedTrip.tripCurrency,
      selectedTrip.homeCurrency,
    )

    const expenseDataToUpdate: Partial<Expense> = {
      name: expenseData.name,
      category: expenseData.category,
      date: expenseData.date,
      amount: expenseData.amount, // Original amount in trip currency
      amountInHomeCurrency, // Converted amount in home currency
      fundType: expenseData.fundType,
      notes: expenseData.notes,
    }

    const success = await updateExpenseDetails(selectedExpense.id, expenseDataToUpdate)
    if (success) {
      setSelectedExpense(null)
      resetExpenseForm()
      setIsEditExpenseOpen(false)
      toast({
        title: "Expense Updated",
        description: `${expenseData.name} has been updated successfully.`,
      })
    }
  }

  // Handle edit expense button click
  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    populateExpenseEditForm(expense)
    setIsEditExpenseOpen(true)
  }

  // Handle delete expense button click
  const handleDeleteExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsDeleteExpenseOpen(true)
  }

  // Handle delete expense
  const handleDeleteExpense = async () => {
    if (!selectedExpense) return

    const success = await removeExpense(selectedExpense.id)
    if (success) {
      setIsDeleteExpenseOpen(false)
      setSelectedExpense(null)
      toast({
        title: "Expense Deleted",
        description: `${selectedExpense.name} has been deleted.`,
        variant: "destructive",
      })
    }
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = parseISO(dateString)
    const today = new Date()

    if (isToday(date)) {
      return "Today"
    } else if (isYesterday(date)) {
      return "Yesterday"
    } else if (differenceInDays(today, date) < 7) {
      return format(date, "EEEE") // Day name
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  // Get category icon
  const getCategoryIcon = (category: ExpenseCategory) => {
    return expenseCategories.find((c) => c.value === category)?.icon || <Briefcase className="h-4 w-4" />
  }

  // Get fund type icon
  const getFundTypeIcon = (fundType: FundType) => {
    switch (fundType) {
      case "budget":
        return <CreditCard className="h-4 w-4 text-primary" />
      case "miscellaneous":
        return <Wallet className="h-4 w-4 text-blue-500" />
      case "safety":
        return <Shield className="h-4 w-4 text-amber-500" />
      default:
        return <CreditCard className="h-4 w-4 text-primary" />
    }
  }

  // Get fund type label
  const getFundTypeLabel = (fundType: FundType) => {
    switch (fundType) {
      case "budget":
        return "Trip Budget"
      case "miscellaneous":
        return "Misc. Funds"
      case "safety":
        return "Safety Funds"
      default:
        return "Unknown"
    }
  }

  // Filter trips based on active tab and search query
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Filter by status
      if (activeTab === "planned" && trip.status !== "planned") return false
      if (activeTab === "ongoing" && trip.status !== "ongoing") return false
      if (activeTab === "completed" && trip.status !== "completed" && trip.status !== "cancelled") return false

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return trip.name.toLowerCase().includes(query) || trip.destination.toLowerCase().includes(query)
      }

      return true
    })
  }, [trips, activeTab, searchQuery])

  // Filter expenses based on active filters
  const filteredExpenses = useMemo(() => {
    if (!selectedTrip || !expenses) return []

    return expenses.filter((expense) => {
      // Filter by category
      if (filterCategory && expense.category !== filterCategory) {
        return false
      }

      // Filter by time
      if (activeTimeFilter !== "all") {
        const expenseDate = parseISO(expense.date)
        const today = new Date()

        if (activeTimeFilter === "today" && !isToday(expenseDate)) {
          return false
        } else if (activeTimeFilter === "yesterday" && !isYesterday(expenseDate)) {
          return false
        } else if (activeTimeFilter === "week" && !isSameWeek(expenseDate, today)) {
          return false
        }
      }

      // Filter by search query
      if (searchExpenseQuery) {
        const query = searchExpenseQuery.toLowerCase()
        return (
          expense.name.toLowerCase().includes(query) ||
          expense.notes?.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [selectedTrip, expenses, filterCategory, activeTimeFilter, searchExpenseQuery])

  // Group expenses by category for chart
  const expensesByCategory = useMemo(() => {
    if (!selectedTrip || !filteredExpenses) return {}

    return filteredExpenses.reduce(
      (acc, expense) => {
        const category = expense.category
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += expense.amountInHomeCurrency
        return acc
      },
      {} as Record<string, number>,
    )
  }, [filteredExpenses, selectedTrip])

  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
      label: expenseCategories.find((c) => c.value === name)?.label || name,
    }))
  }, [expensesByCategory])

  // Prepare data for bar chart (expenses by day)
  const expensesByDay = useMemo(() => {
    if (!selectedTrip || !filteredExpenses) return {}

    return filteredExpenses.reduce(
      (acc, expense) => {
        const date = expense.date
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += expense.amountInHomeCurrency
        return acc
      },
      {} as Record<string, number>,
    )
  }, [filteredExpenses, selectedTrip])

  const barChartData = useMemo(() => {
    return Object.entries(expensesByDay)
      .map(([date, amount]) => ({
        date: format(parseISO(date), "MMM d"),
        amount,
        fullDate: date,
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
  }, [expensesByDay])

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    if (!selectedTrip || !filteredExpenses) return []

    const grouped: Record<string, Expense[]> = {}

    filteredExpenses.forEach((expense) => {
      if (!grouped[expense.date]) {
        grouped[expense.date] = []
      }
      grouped[expense.date].push(expense)
    })

    // Sort dates in descending order (newest first)
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, expenses]) => ({
        date,
        displayDate: formatDateForDisplay(date),
        expenses: expenses.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), // Sort expenses by creation time
      }))
  }, [filteredExpenses, selectedTrip])

  // Calculate total spent for filtered expenses
  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((total, expense) => total + expense.amountInHomeCurrency, 0)
  }, [filteredExpenses])

  // Colors for pie chart
  const COLORS = ["#f472b6", "#c084fc", "#fcd34d", "#4ade80", "#60a5fa", "#f97316", "#a78bfa", "#fb7185"]

  const getTasksForDate = (date: string) => {
    if (!tasks) return []
    return tasks[date] || []
  }

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-500"
      case "ongoing":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTripTypeIcon = (type: string) => {
    switch (type) {
      case "solo":
        return <Users className="h-4 w-4" />
      case "couple":
        return <Users className="h-4 w-4" />
      case "family":
        return <Users className="h-4 w-4" />
      case "business":
        return <Briefcase className="h-4 w-4" />
      case "friends":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  // Render trip list view
  const renderTripList = () => {
    if (tripsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )
    }

    if (filteredTrips.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No trips found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "No trips match your search criteria."
              : activeTab === "planned"
                ? "You don't have any planned trips yet."
                : activeTab === "ongoing"
                  ? "You don't have any ongoing trips."
                  : "You don't have any completed trips."}
          </p>
          <Button onClick={() => setIsAddTripOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "planned" ? "Plan a New Trip" : "Add Trip"}
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200 group">
              <div className="absolute top-3 right-3 z-10">
                <Badge className={`${getTripStatusColor(trip.status)} text-white capitalize`}>{trip.status}</Badge>
              </div>
              <div className="relative h-40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10"></div>
                <div className="h-64 w-full">
                  <ImageCarousel />
                </div>
                <div className="absolute bottom-4 left-4 z-10 text-white">
                  <h3 className="text-xl font-bold">{trip.name}</h3>
                  <div className="flex items-center mt-1 text-white/80">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {trip.destination}
                  </div>
                </div>
              </div>
              <CardContent className="pb-3 flex-1 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {getTripTypeIcon(trip.tripType)}
                      <span className="text-sm ml-2">
                        {trip.people} {trip.people === 1 ? "Person" : "People"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget:</span>
                    <span className="font-medium">{formatCurrency(trip.budget, trip.homeCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Safety Funds:</span>
                    <span className="font-medium">{formatCurrency(trip.safetyFunds, trip.homeCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Currency:</span>
                    <span className="font-medium">
                      {trip.homeCurrency} → {trip.tripCurrency}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/trips?id=${trip.id}`)}>
                  View Details
                </Button>
                {trip.status === "planned" && (
                  <Button size="sm" onClick={() => handleStartTrip(trip.id)}>
                    Start Trip
                  </Button>
                )}
                {trip.status === "ongoing" && (
                  <Button size="sm" onClick={() => handleCompleteTrip(trip.id)}>
                    Complete Trip
                  </Button>
                )}
                {trip.status === "planned" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsDeleteTripOpen(true)
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  // Render trip detail view
  const renderTripDetail = () => {
    if (!selectedTrip) return null

    const { budgetRemaining, safetyRemaining, status } = calculateFundsStatus(selectedTrip)
    const tripDates = getTripDates(selectedTrip)
    const totalTasks = Object.values(tasks || {}).flat().length
    const completedTasks = Object.values(tasks || {})
      .flat()
      .filter((task) => task.completed).length
    const taskCompletionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate total spent
    const totalSpent = expenses?.reduce((sum, expense) => sum + expense.amountInHomeCurrency, 0) || 0

    // Calculate budget percentage used
    const budgetPercentageUsed = selectedTrip.budget > 0 ? Math.round((totalSpent / selectedTrip.budget) * 100) : 0

    // Calculate daily budget
    const tripDuration = differenceInDays(new Date(selectedTrip.endDate), new Date(selectedTrip.startDate)) + 1
    const dailyBudget = selectedTrip.budget / tripDuration

    // Calculate days elapsed
    const daysElapsed = Math.min(
      tripDuration,
      Math.max(1, differenceInDays(new Date(), parseISO(selectedTrip.startDate)) + 1),
    )

    // Calculate daily average spent
    const dailyAvgSpent = totalSpent / daysElapsed

    // Calculate budget status (over/under)
    const budgetStatus = dailyAvgSpent > dailyBudget ? "over" : "under"
    const budgetDifference = Math.abs(dailyAvgSpent - dailyBudget)
    const budgetDifferencePercentage = dailyBudget > 0 ? Math.round((budgetDifference / dailyBudget) * 100) : 0

    return (
      <div className="space-y-6">
        {/* Trip Header */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"></div>
          <div className="h-48 sm:h-64 w-full">
            <ImageCarousel />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20 text-white">
            <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-end md:space-y-0 gap-4">
              <div>
                <Badge className={`${getTripStatusColor(selectedTrip.status)} text-white capitalize mb-3`}>
                  {selectedTrip.status}
                </Badge>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{selectedTrip.name}</h1>
                <div className="flex items-center mt-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">{selectedTrip.destination}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    onClick={() => {
                      populateEditForm(selectedTrip)
                      setIsEditTripOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Trip
                  </Button>
                )}
                {selectedTrip.status === "planned" && (
                  <Button
                    size="sm"
                    className="bg-primary/90 hover:bg-primary"
                    onClick={() => handleStartTrip(selectedTrip.id)}
                  >
                    Start Trip
                  </Button>
                )}
                {selectedTrip.status === "ongoing" && (
                  <Button
                    size="sm"
                    className="bg-primary/90 hover:bg-primary"
                    onClick={() => handleCompleteTrip(selectedTrip.id)}
                  >
                    Complete Trip
                  </Button>
                )}
                {selectedTrip.status === "planned" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-destructive/90 hover:bg-destructive"
                    onClick={() => setIsDeleteTripOpen(true)}
                  >
                    Cancel Trip
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trip Info Bar */}
        <div className="bg-muted rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Dates</span>
              <div className="flex items-center mt-1">
                <CalendarIcon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">
                  {format(new Date(selectedTrip.startDate), "MMM d")} -{" "}
                  {format(new Date(selectedTrip.endDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Trip Type</span>
              <div className="flex items-center mt-1">
                {getTripTypeIcon(selectedTrip.tripType)}
                <span className="font-medium capitalize ml-2 text-sm sm:text-base truncate">
                  {selectedTrip.tripType} • {selectedTrip.people} {selectedTrip.people === 1 ? "Person" : "People"}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Currency</span>
              <div className="flex items-center mt-1">
                <Globe className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base truncate">
                  {selectedTrip.homeCurrency} → {selectedTrip.tripCurrency}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Tasks</span>
              <div className="flex items-center mt-1">
                <CheckCircle className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">
                  {completedTasks}/{totalTasks} Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b">
          <button
            className={cn(
              "px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border-b-2 transition-colors whitespace-nowrap",
              activeSection === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted",
            )}
            onClick={() => setActiveSection("overview")}
          >
            <Layers className="h-4 w-4" />
            Overview
          </button>
          <button
            className={cn(
              "px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border-b-2 transition-colors whitespace-nowrap",
              activeSection === "tasks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted",
            )}
            onClick={() => setActiveSection("tasks")}
          >
            <CheckCircle className="h-4 w-4" />
            Tasks
          </button>
          <button
            className={cn(
              "px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 border-b-2 transition-colors whitespace-nowrap",
              activeSection === "expenses"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted",
            )}
            onClick={() => setActiveSection("expenses")}
          >
            <Wallet className="h-4 w-4" />
            Expenses
          </button>
        </div>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          {activeSection === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enhanced Budget Summary Card */}
                <Card className="lg:col-span-2 overflow-hidden">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-primary" />
                        <CardTitle className="text-lg">Budget Summary</CardTitle>
                      </div>
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Track your spending against your budget. The daily average shows how your actual spending
                              compares to your planned daily budget.
                            </p>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      {/* Left side - Budget overview */}
                      <div className="p-4 border-r">
                        <div className="space-y-4">
                          {/* Total Budget */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Total Budget</span>
                              <span className="text-lg font-bold">
                                {formatCurrency(selectedTrip.budget, selectedTrip.homeCurrency)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Trip Duration</span>
                              <span>{tripDuration} days</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Daily Budget</span>
                              <span>{formatCurrency(dailyBudget, selectedTrip.homeCurrency)}/day</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Spent & Remaining */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Spent So Far</span>
                              <span className="text-lg font-bold">
                                {formatCurrency(totalSpent, selectedTrip.homeCurrency)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Days Elapsed</span>
                              <span>
                                {daysElapsed} of {tripDuration}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Daily Average</span>
                              <span
                                className={
                                  dailyAvgSpent > dailyBudget
                                    ? "text-red-500 font-medium"
                                    : "text-green-500 font-medium"
                                }
                              >
                                {formatCurrency(dailyAvgSpent, selectedTrip.homeCurrency)}/day
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Remaining Budget</span>
                              <span
                                className={
                                  budgetRemaining === 0 && status !== "budget" ? "text-red-500 font-bold" : "font-bold"
                                }
                              >
                                {formatCurrency(budgetRemaining, selectedTrip.homeCurrency)}
                              </span>
                            </div>
                            <Progress
                              value={(budgetRemaining / selectedTrip.budget) * 100}
                              className="h-2"
                              indicatorClassName={
                                budgetRemaining / selectedTrip.budget <= 0.1
                                  ? "bg-red-500"
                                  : budgetRemaining / selectedTrip.budget <= 0.25
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{budgetPercentageUsed}% Used</span>
                              <span>{100 - budgetPercentageUsed}% Remaining</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Safety funds & Budget status */}
                      <div className="p-4">
                        <div className="space-y-4">
                          {/* Safety Funds */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Safety Funds</span>
                              <span className="text-lg font-bold">
                                {formatCurrency(selectedTrip.safetyFunds, selectedTrip.homeCurrency)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Remaining</span>
                                <span className={safetyRemaining === 0 && status === "depleted" ? "text-red-500" : ""}>
                                  {formatCurrency(safetyRemaining, selectedTrip.homeCurrency)}
                                </span>
                              </div>
                              <Progress
                                value={(safetyRemaining / (selectedTrip.safetyFunds || 1)) * 100}
                                className="h-2"
                                indicatorClassName={
                                  safetyRemaining / (selectedTrip.safetyFunds || 1) <= 0.1
                                    ? "bg-red-500"
                                    : safetyRemaining / (selectedTrip.safetyFunds || 1) <= 0.25
                                      ? "bg-amber-500"
                                      : "bg-amber-500"
                                }
                              />
                            </div>
                          </div>

                          <Separator />

                          {/* Budget Status */}
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium">Budget Status</span>
                              <Badge
                                className={`ml-2 ${budgetStatus === "over" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}
                              >
                                {budgetStatus === "over" ? "OVER BUDGET" : "UNDER BUDGET"}
                              </Badge>
                            </div>

                            <div className="flex items-center">
                              {budgetStatus === "over" ? (
                                <TrendingUp className="h-10 w-10 text-red-500 mr-3" />
                              ) : (
                                <TrendingDown className="h-10 w-10 text-green-500 mr-3" />
                              )}
                              <div>
                                <div className="text-sm">
                                  You're spending{" "}
                                  <span className="font-bold">
                                    {formatCurrency(budgetDifference, selectedTrip.homeCurrency)}/day
                                  </span>{" "}
                                  {budgetStatus === "over" ? "more" : "less"} than planned
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  That's {budgetDifferencePercentage}% {budgetStatus === "over" ? "above" : "below"}{" "}
                                  your daily budget
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Alert Messages */}
                          {status === "safety" && (
                            <Alert className="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400 mt-2">
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
                                Your budget and safety funds have all been depleted. Consider adding more funds or
                                reducing expenses.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Currency Info Card - Redesigned */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-primary" />
                      Currency Information
                    </CardTitle>
                    <CardDescription className="text-center text-base font-medium text-foreground">
                      Your expenses will be tracked using the latest rates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center pb-3">
                    <div className="flex items-center justify-center gap-4 py-2">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Home Currency</div>
                        <div className="text-3xl font-bold mt-1">{selectedTrip.homeCurrency}</div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Trip Currency</div>
                        <div className="text-3xl font-bold mt-1">{selectedTrip.tripCurrency}</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t flex flex-col items-center">
                    {lastUpdated && (
                      <p className="text-xs text-muted-foreground w-full text-center mb-2">
                        Last updated: {format(lastUpdated, "MMM dd, yyyy HH:mm")}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshExchangeRates}
                      disabled={!canRefreshRates || isLoadingRates}
                      className="w-full bg-transparent"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isLoadingRates ? "Refreshing..." : "Refresh Rates"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Expense Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Expense Summary
                  </CardTitle>
                  <CardDescription>Overview of your spending</CardDescription>
                </CardHeader>
                <CardContent>
                  {expenses && expenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No expenses recorded for this trip yet</p>
                      {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                        <Button
                          onClick={() => {
                            setIsAddExpenseOpen(true)
                            setActiveSection("expenses")
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Expense
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Expense Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Total Expenses</div>
                          <div className="text-2xl font-bold mt-1">
                            {formatCurrency(
                              expenses.reduce((sum, expense) => sum + expense.amountInHomeCurrency, 0),
                              selectedTrip.homeCurrency,
                            )}
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Daily Average</div>
                          <div className="text-2xl font-bold mt-1">
                            {(() => {
                              const totalSpent = expenses.reduce(
                                (sum, expense) => sum + expense.amountInHomeCurrency,
                                0,
                              )
                              const daysElapsed = Math.max(
                                1,
                                differenceInDays(new Date(), parseISO(selectedTrip.startDate)) + 1,
                              )
                              return formatCurrency(totalSpent / daysElapsed, selectedTrip.homeCurrency)
                            })()}
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Top Category</div>
                          <div className="text-2xl font-bold mt-1">
                            {(() => {
                              if (Object.keys(expensesByCategory).length === 0) return "N/A"
                              const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0]
                              return expenseCategories.find((c) => c.value === topCategory[0])?.label || topCategory[0]
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Expense Charts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card rounded-lg border p-4">
                          <h4 className="text-sm font-medium mb-4 flex items-center">
                            <PieChartIcon className="mr-2 h-4 w-4 text-primary" />
                            Expenses by Category
                          </h4>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${expenseCategories.find((c) => c.value === name)?.label || name} ${(percent * 100).toFixed(0)}%`
                                  }
                                >
                                  {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Legend />
                                <ChartTooltip
                                  formatter={(value) => [
                                    `${formatCurrency(value as number, selectedTrip.homeCurrency)}`,
                                    "Amount",
                                  ]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-card rounded-lg border p-4">
                          <h4 className="text-sm font-medium mb-4 flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                            Expenses by Day
                          </h4>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => [
                                    `${formatCurrency(value as number, selectedTrip.homeCurrency)}`,
                                    "Amount",
                                  ]}
                                />
                                <Bar dataKey="amount" fill="#f472b6" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button variant="outline" onClick={() => setActiveSection("expenses")} className="group">
                          View All Expenses
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Task Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Task Summary
                  </CardTitle>
                  <CardDescription>Overview of your itinerary</CardDescription>
                </CardHeader>
                <CardContent>
                  {!tasks || Object.keys(tasks).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No tasks added to this trip yet</p>
                      {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                        <Button
                          onClick={() => {
                            setIsAddTaskOpen(true)
                            setActiveSection("tasks")
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Task
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Total Tasks</div>
                          <div className="text-2xl font-bold mt-1">{totalTasks}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Completed</div>
                          <div className="text-2xl font-bold mt-1">{completedTasks}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <div className="text-sm text-muted-foreground">Completion Rate</div>
                          <div className="text-2xl font-bold mt-1">{taskCompletionPercentage}%</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Upcoming Tasks</h4>
                        <div className="space-y-2">
                          {(() => {
                            // Get all tasks and sort by date
                            const allTasks = Object.entries(tasks)
                              .flatMap(([date, tasks]) => tasks.map((task) => ({ ...task, date })))
                              .filter((task) => !task.completed)
                              .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                              .slice(0, 3)

                            if (allTasks.length === 0) {
                              return <div className="text-center py-4 text-muted-foreground">All tasks completed!</div>
                            }

                            return allTasks.map((task) => (
                              <div key={task.id} className="p-3 rounded-lg border">
                                <div className="flex-1">
                                  <div className="font-medium">{task.name}</div>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {format(new Date(task.date), "MMM d")}
                                    {task.time && (
                                      <>
                                        <Clock className="h-3 w-3 ml-2 mr-1" />
                                        {new Date(`2000-01-01T${task.time}`).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2"
                                  onClick={() => handleToggleTaskCompletion(task.date, task.id, task.completed)}
                                >
                                  Complete
                                </Button>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button variant="outline" onClick={() => setActiveSection("tasks")} className="group">
                          View All Tasks
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === "expenses" && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Expense Tracker */}
              <ExpenseTracker tripId={selectedTrip.id} />
            </motion.div>
          )}

          {activeSection === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Task Management Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                    Trip Tasks
                  </h2>
                  <p className="text-sm text-muted-foreground">Manage your itinerary for this trip</p>
                </div>

                {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                  <Button onClick={() => setIsAddTaskOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                )}
              </div>

              {/* Date Selection */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="date-select" className="text-sm font-medium">
                      Select Date
                    </Label>
                    <Select value={selectedDate || ""} onValueChange={(value) => setSelectedDate(value)}>
                      <SelectTrigger id="date-select">
                        <SelectValue placeholder="Select a date" />
                      </SelectTrigger>
                      <SelectContent>
                        {tripDates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {format(new Date(date), "EEEE, MMMM d, yyyy")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {totalTasks} Total Tasks
                    </Badge>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {completedTasks} Completed
                    </Badge>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {taskCompletionPercentage}% Done
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Task List */}
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Select a date to view or add tasks</p>
                </div>
              ) : (
                <>
                  <div className="bg-card rounded-lg border overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-medium">Tasks for {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</h3>
                    </div>

                    {getTasksForDate(selectedDate).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No tasks for this day</p>
                        {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                          <Button onClick={() => setIsAddTaskOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {getTasksForDate(selectedDate).map((task) => (
                          <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="pt-0.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-6 w-6 rounded-full border",
                                      task.completed
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-muted-foreground",
                                    )}
                                    onClick={() => handleToggleTaskCompletion(selectedDate, task.id, task.completed)}
                                  >
                                    {task.completed && <CheckCircle className="h-4 w-4" />}
                                    <span className="sr-only">
                                      {task.completed ? "Mark as incomplete" : "Mark as complete"}
                                    </span>
                                  </Button>
                                </div>
                                <div>
                                  <h4
                                    className={cn(
                                      "font-medium",
                                      task.completed && "line-through text-muted-foreground",
                                    )}
                                  >
                                    {task.name}
                                  </h4>
                                  {(task.time || task.location) && (
                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                      {task.time && (
                                        <div className="flex items-center">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {new Date(`2000-01-01T${task.time}`).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      )}
                                      {task.location && (
                                        <div className="flex items-center">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {task.location}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {task.notes && <p className="mt-2 text-sm text-muted-foreground">{task.notes}</p>}
                                  {task.budgetCost > 0 && (
                                    <div className="mt-2 flex items-center">
                                      <Badge variant="outline" className="text-xs">
                                        <CreditCard className="h-3 w-3 mr-1" />
                                        {formatCurrency(task.budgetCost, selectedTrip.tripCurrency)}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete task</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* All Tasks Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">All Tasks</CardTitle>
                  <CardDescription>Overview of all tasks across your trip</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(tasks || {}).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No tasks added to this trip yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="pending">Pending</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="space-y-4 mt-4">
                          {Object.entries(tasks || {})
                            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                            .map(([date, dateTasks]) => (
                              <div key={date} className="space-y-2">
                                <h4 className="text-sm font-medium">{format(new Date(date), "EEEE, MMMM d, yyyy")}</h4>
                                <div className="bg-muted/30 rounded-lg divide-y">
                                  {dateTasks.map((task) => (
                                    <div key={task.id} className="p-3 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "h-5 w-5 rounded-full border",
                                            task.completed
                                              ? "bg-primary text-primary-foreground border-primary"
                                              : "border-muted-foreground",
                                          )}
                                          onClick={() => handleToggleTaskCompletion(date, task.id, task.completed)}
                                        >
                                          {task.completed && <CheckCircle className="h-3 w-3" />}
                                          <span className="sr-only">
                                            {task.completed ? "Mark as incomplete" : "Mark as complete"}
                                          </span>
                                        </Button>
                                        <span className={cn(task.completed && "line-through text-muted-foreground")}>
                                          {task.name}
                                        </span>
                                      </div>
                                      {task.time && (
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(`2000-01-01T${task.time}`).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </TabsContent>
                        <TabsContent value="pending" className="space-y-4 mt-4">
                          {Object.entries(tasks || {})
                            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                            .map(([date, dateTasks]) => {
                              const pendingTasks = dateTasks.filter((task) => !task.completed)
                              if (pendingTasks.length === 0) return null

                              return (
                                <div key={date} className="space-y-2">
                                  <h4 className="text-sm font-medium">
                                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                                  </h4>
                                  <div className="bg-muted/30 rounded-lg divide-y">
                                    {pendingTasks.map((task) => (
                                      <div key={task.id} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 rounded-full border border-muted-foreground"
                                            onClick={() => handleToggleTaskCompletion(date, task.id, task.completed)}
                                          >
                                            <span className="sr-only">Mark as complete</span>
                                          </Button>
                                          <span>{task.name}</span>
                                        </div>
                                        {task.time && (
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(`2000-01-01T${task.time}`).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                        </TabsContent>
                        <TabsContent value="completed" className="space-y-4 mt-4">
                          {Object.entries(tasks || {})
                            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                            .map(([date, dateTasks]) => {
                              const completedTasks = dateTasks.filter((task) => task.completed)
                              if (completedTasks.length === 0) return null

                              return (
                                <div key={date} className="space-y-2">
                                  <h4 className="text-sm font-medium">
                                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                                  </h4>
                                  <div className="bg-muted/30 rounded-lg divide-y">
                                    {completedTasks.map((task) => (
                                      <div key={task.id} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 rounded-full border bg-primary text-primary-foreground border-primary"
                                            onClick={() => handleToggleTaskCompletion(date, task.id, task.completed)}
                                          >
                                            <CheckCircle className="h-3 w-3" />
                                            <span className="sr-only">Mark as incomplete</span>
                                          </Button>
                                          <span className="line-through text-muted-foreground">{task.name}</span>
                                        </div>
                                        {task.time && (
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(`2000-01-01T${task.time}`).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Tracker</h1>
          <p className="text-muted-foreground">Plan and manage your trips with ease</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {!selectedTrip && (
            <>
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search trips..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Dialog open={isAddTripOpen} onOpenChange={setIsAddTripOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                  <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl">Add New Trip</DialogTitle>
                    <DialogDescription>Enter the details of your upcoming trip</DialogDescription>
                  </DialogHeader>

                  <div className="px-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                    <div className="space-y-6 py-4">
                      {/* Trip Details Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Trip Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="trip-name">Trip Name</Label>
                            <Input
                              id="trip-name"
                              value={newTrip.name}
                              onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                              placeholder="Summer Vacation"
                              className={tripFormErrors.name ? "border-red-500" : ""}
                            />
                            {tripFormErrors.name && <p className="text-xs text-red-500">{tripFormErrors.name}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="destination">Destination</Label>
                            <Input
                              id="destination"
                              value={newTrip.destination}
                              onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                              placeholder="Paris, France"
                              className={tripFormErrors.destination ? "border-red-500" : ""}
                            />
                            {tripFormErrors.destination && (
                              <p className="text-xs text-red-500">{tripFormErrors.destination}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dates Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Trip Dates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={newTrip.startDate}
                              onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                              className={tripFormErrors.startDate ? "border-red-500" : ""}
                            />
                            {tripFormErrors.startDate && (
                              <p className="text-xs text-red-500">{tripFormErrors.startDate}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="end-date">End Date</Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={newTrip.endDate}
                              onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                              className={tripFormErrors.endDate ? "border-red-500" : ""}
                            />
                            {tripFormErrors.endDate && <p className="text-xs text-red-500">{tripFormErrors.endDate}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Travelers Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Travelers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="trip-type">Trip Type</Label>
                            <Select
                              value={newTrip.tripType}
                              onValueChange={(value) => setNewTrip({ ...newTrip, tripType: value as TripType })}
                            >
                              <SelectTrigger id="trip-type" className={tripFormErrors.tripType ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select trip type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solo">Solo</SelectItem>
                                <SelectItem value="couple">Couple</SelectItem>
                                <SelectItem value="family">Family</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="friends">Friends</SelectItem>
                              </SelectContent>
                            </Select>
                            {tripFormErrors.tripType && (
                              <p className="text-xs text-red-500">{tripFormErrors.tripType}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="people">Number of People</Label>
                            <Input
                              id="people"
                              type="number"
                              min={1}
                              value={newTrip.people}
                              onChange={(e) => setNewTrip({ ...newTrip, people: Number.parseInt(e.target.value) || 1 })}
                              className={tripFormErrors.people ? "border-red-500" : ""}
                            />
                            {tripFormErrors.people && <p className="text-xs text-red-500">{tripFormErrors.people}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Currency Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Currency Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="home-currency">Home Currency</Label>
                            <SimpleCurrencySelector
                              value={newTrip.homeCurrency}
                              onValueChange={(value) => setNewTrip({ ...newTrip, homeCurrency: value })}
                              placeholder="Select home currency"
                              className={tripFormErrors.homeCurrency ? "border-red-500" : ""}
                            />
                            {tripFormErrors.homeCurrency && (
                              <p className="text-xs text-red-500">{tripFormErrors.homeCurrency}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trip-currency">Trip Currency</Label>
                            <SimpleCurrencySelector
                              value={newTrip.tripCurrency}
                              onValueChange={(value) => setNewTrip({ ...newTrip, tripCurrency: value })}
                              placeholder="Select trip currency"
                              className={tripFormErrors.tripCurrency ? "border-red-500" : ""}
                            />
                            {tripFormErrors.tripCurrency && (
                              <p className="text-xs text-red-500">{tripFormErrors.tripCurrency}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Budget Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Budget Planning</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="budget">Trip Budget</Label>
                            <div className="flex items-center">
                              <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="budget"
                                type="number"
                                min={0}
                                step={0.01}
                                value={newTrip.budget}
                                onChange={(e) =>
                                  setNewTrip({ ...newTrip, budget: Number.parseFloat(e.target.value) || 0 })
                                }
                                className={tripFormErrors.budget ? "border-red-500" : ""}
                              />
                            </div>
                            {tripFormErrors.budget && <p className="text-xs text-red-500">{tripFormErrors.budget}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="safety-funds">Safety Funds</Label>
                            <div className="flex items-center">
                              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="safety-funds"
                                type="number"
                                min={0}
                                step={0.01}
                                value={newTrip.safetyFunds}
                                onChange={(e) =>
                                  setNewTrip({ ...newTrip, safetyFunds: Number.parseFloat(e.target.value) || 0 })
                                }
                                className={tripFormErrors.safetyFunds ? "border-red-500" : ""}
                              />
                            </div>
                            {tripFormErrors.safetyFunds && (
                              <p className="text-xs text-red-500">{tripFormErrors.safetyFunds}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="px-6 py-4 border-t">
                    <Button variant="outline" onClick={() => setIsAddTripOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTrip}>Save Trip</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {selectedTrip ? (
        renderTripDetail()
      ) : (
        <Tabs defaultValue="planned" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planned">Planned Trips</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing Trips</TabsTrigger>
            <TabsTrigger value="completed">Completed Trips</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {renderTripList()}
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Trip Dialog */}
      <Dialog open={isEditTripOpen} onOpenChange={setIsEditTripOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl">Edit Trip</DialogTitle>
            <DialogDescription>Update the details of your trip</DialogDescription>
          </DialogHeader>

          <div className="px-6 overflow-y-auto max-h-[calc(80vh-180px)]">
            <div className="space-y-6 py-4">
              {/* Trip Details Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Trip Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-trip-name">Trip Name</Label>
                    <Input
                      id="edit-trip-name"
                      value={newTrip.name}
                      onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                      className={tripFormErrors.name ? "border-red-500" : ""}
                    />
                    {tripFormErrors.name && <p className="text-xs text-red-500">{tripFormErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-destination">Destination</Label>
                    <Input
                      id="edit-destination"
                      value={newTrip.destination}
                      onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                      className={tripFormErrors.destination ? "border-red-500" : ""}
                    />
                    {tripFormErrors.destination && <p className="text-xs text-red-500">{tripFormErrors.destination}</p>}
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Trip Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Start Date</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                      className={tripFormErrors.startDate ? "border-red-500" : ""}
                    />
                    {tripFormErrors.startDate && <p className="text-xs text-red-500">{tripFormErrors.startDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date">End Date</Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={newTrip.endDate}
                      onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                      className={tripFormErrors.endDate ? "border-red-500" : ""}
                    />
                    {tripFormErrors.endDate && <p className="text-xs text-red-500">{tripFormErrors.endDate}</p>}
                  </div>
                </div>
              </div>

              {/* Travelers Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Travelers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-trip-type">Trip Type</Label>
                    <Select
                      value={newTrip.tripType}
                      onValueChange={(value) => setNewTrip({ ...newTrip, tripType: value as TripType })}
                    >
                      <SelectTrigger id="edit-trip-type" className={tripFormErrors.tripType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                      </SelectContent>
                    </Select>
                    {tripFormErrors.tripType && <p className="text-xs text-red-500">{tripFormErrors.tripType}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-people">Number of People</Label>
                    <Input
                      id="edit-people"
                      type="number"
                      min={1}
                      value={newTrip.people}
                      onChange={(e) => setNewTrip({ ...newTrip, people: Number.parseInt(e.target.value) || 1 })}
                      className={tripFormErrors.people ? "border-red-500" : ""}
                    />
                    {tripFormErrors.people && <p className="text-xs text-red-500">{tripFormErrors.people}</p>}
                  </div>
                </div>
              </div>

              {/* Currency Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Currency Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-home-currency">Home Currency</Label>
                    <SimpleCurrencySelector
                      value={newTrip.homeCurrency}
                      onValueChange={(value) => setNewTrip({ ...newTrip, homeCurrency: value })}
                      placeholder="Select home currency"
                      className={tripFormErrors.homeCurrency ? "border-red-500" : ""}
                    />
                    {tripFormErrors.homeCurrency && (
                      <p className="text-xs text-red-500">{tripFormErrors.homeCurrency}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-trip-currency">Trip Currency</Label>
                    <SimpleCurrencySelector
                      value={newTrip.tripCurrency}
                      onValueChange={(value) => setNewTrip({ ...newTrip, tripCurrency: value })}
                      placeholder="Select trip currency"
                      className={tripFormErrors.tripCurrency ? "border-red-500" : ""}
                    />
                    {tripFormErrors.tripCurrency && (
                      <p className="text-xs text-red-500">{tripFormErrors.tripCurrency}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget Section */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">Budget Planning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-budget">Trip Budget</Label>
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="edit-budget"
                        type="number"
                        min={0}
                        step={0.01}
                        value={newTrip.budget}
                        onChange={(e) => setNewTrip({ ...newTrip, budget: Number.parseFloat(e.target.value) || 0 })}
                        className={tripFormErrors.budget ? "border-red-500" : ""}
                      />
                    </div>
                    {tripFormErrors.budget && <p className="text-xs text-red-500">{tripFormErrors.budget}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-safety-funds">Safety Funds</Label>
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="edit-safety-funds"
                        type="number"
                        min={0}
                        step={0.01}
                        value={newTrip.safetyFunds}
                        onChange={(e) =>
                          setNewTrip({ ...newTrip, safetyFunds: Number.parseFloat(e.target.value) || 0 })
                        }
                        className={tripFormErrors.safetyFunds ? "border-red-500" : ""}
                      />
                    </div>
                    {tripFormErrors.safetyFunds && <p className="text-xs text-red-500">{tripFormErrors.safetyFunds}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setIsEditTripOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTrip}>Update Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Add a task for {selectedDate ? format(new Date(selectedDate), "MMMM d, yyyy") : "selected date"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder="Visit Eiffel Tower"
                className={taskFormErrors.name ? "border-red-500" : ""}
              />
              {taskFormErrors.name && <p className="text-xs text-red-500">{taskFormErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-location">Location</Label>
                <Input
                  id="task-location"
                  value={newTask.location}
                  onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                  placeholder="Champ de Mars, Paris"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-time">Time</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-budget">Budget Cost ({selectedTrip?.tripCurrency})</Label>
              <Input
                id="task-budget"
                type="number"
                min={0}
                value={newTask.budgetCost}
                onChange={(e) => setNewTask({ ...newTask, budgetCost: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={taskFormErrors.budgetCost ? "border-red-500" : ""}
              />
              {taskFormErrors.budgetCost && <p className="text-xs text-red-500">{taskFormErrors.budgetCost}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-notes">Notes</Label>
              <Textarea
                id="task-notes"
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Additional details about the task"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Trip Confirmation */}
      <AlertDialog open={isDeleteTripOpen} onOpenChange={setIsDeleteTripOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trip
              {selectedTrip ? ` "${selectedTrip.name}"` : ""} and all associated tasks and expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrip} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
