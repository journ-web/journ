"use client"

import { CardDescription } from "@/components/ui/card"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTrips } from "@/hooks/use-trips"
import { useExpenses } from "@/hooks/use-expenses"
import { useTasks } from "@/hooks/use-tasks"
import { useExchangeRates } from "@/utils/exchange-rates"
import type { Trip } from "@/types/trip"
import { ExpenseForm } from "@/components/dashboard/trip-planner/expense-form"
import { TaskForm } from "@/components/dashboard/todo/task-form"

interface TripDetailProps {
  trip: Trip
}

export function TripDetail({ trip }: TripDetailProps) {
  const router = useRouter()
  const { updateTripDetails: updateTrip, removeTrip } = useTrips()
  const { expenses, addExpense, updateExpenseDetails, removeExpense } = useExpenses(trip.id)
  const { tasks, addTask, updateTask, deleteTask } = useTasks(trip.id)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [editingTask, setEditingTask] = useState<any>(null)

  // Use exchange rates hook
  const {
    rates,
    lastUpdated,
    isLoading: isRatesLoading,
    error: ratesError,
    refreshExchangeRates,
    canRefresh: canRefreshRates,
    getExchangeRate,
  } = useExchangeRates()

  // Filter expenses and tasks for this trip
  const tripExpenses = expenses.filter((expense) => expense.tripId === trip.id)
  const tripTasks = tasks.filter((task) => task.tripId === trip.id)

  // Calculate totals
  const totalExpenses = tripExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetUsed = trip.budget ? (totalExpenses / trip.budget) * 100 : 0
  const completedTasks = tripTasks.filter((task) => task.completed).length
  const taskProgress = tripTasks.length > 0 ? (completedTasks / tripTasks.length) * 100 : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-500"
      case "ongoing":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "planned":
        return "Planned"
      case "ongoing":
        return "Ongoing"
      case "completed":
        return "Completed"
      default:
        return "Unknown"
    }
  }

  const handleStatusChange = async (newStatus: "planned" | "ongoing" | "completed") => {
    try {
      await updateTrip(trip.id, { status: newStatus })
    } catch (error) {
      console.error("Error updating trip status:", error)
    }
  }

  const handleDeleteTrip = async () => {
    if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      try {
        await removeTrip(trip.id)
        router.push("/dashboard/trips")
      } catch (error) {
        console.error("Error deleting trip:", error)
      }
    }
  }

  const handleAddExpense = async (expenseData: any) => {
    try {
      await addExpense({
        ...expenseData,
        tripId: trip.id,
        date: new Date().toISOString(),
      })
      setShowExpenseForm(false)
    } catch (error) {
      console.error("Error adding expense:", error)
    }
  }

  const handleUpdateExpense = async (expenseData: any) => {
    if (editingExpense) {
      try {
        await updateExpenseDetails(editingExpense.id, expenseData)
        setEditingExpense(null)
        setShowExpenseForm(false)
      } catch (error) {
        console.error("Error updating expense:", error)
      }
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await removeExpense(expenseId)
      } catch (error) {
        console.error("Error deleting expense:", error)
      }
    }
  }

  const handleAddTask = async (taskData: any) => {
    try {
      await addTask({
        ...taskData,
        tripId: trip.id,
        completed: false,
        createdAt: new Date().toISOString(),
      })
      setShowTaskForm(false)
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const handleUpdateTask = async (taskData: any) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, taskData)
        setEditingTask(null)
        setShowTaskForm(false)
      } catch (error) {
        console.error("Error updating task:", error)
      }
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed })
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId)
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    }
  }

  // The exchange rate is no longer explicitly displayed, but the hook is still used for potential future features
  // or if expense tracking internally relies on it.
  const displayExchangeRate = getExchangeRate(trip.currency, trip.homeCurrency, rates)
  const isExchangeRateAvailable =
    !isRatesLoading &&
    ratesError === null &&
    rates &&
    Object.keys(rates).length > 0 &&
    rates[trip.currency] !== undefined &&
    rates[trip.homeCurrency] !== undefined &&
    displayExchangeRate !== 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <p className="text-muted-foreground">{trip.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(trip.status)}>{getStatusText(trip.status)}</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowExpenseForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Trip Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destination</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trip.destination}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(
                (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24),
              )}{" "}
              days
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(trip.startDate), "MMM dd")} - {format(new Date(trip.endDate), "MMM dd, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${trip.budget?.toLocaleString() || "N/A"}</div>
            <Progress value={budgetUsed} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              ${totalExpenses.toLocaleString()} spent ({budgetUsed.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks}/{tripTasks.length}
            </div>
            <Progress value={taskProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{taskProgress.toFixed(0)}% completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Change Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={trip.status === "planned" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("planned")}
        >
          Mark as Planned
        </Button>
        <Button
          variant={trip.status === "ongoing" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("ongoing")}
        >
          Mark as Ongoing
        </Button>
        <Button
          variant={trip.status === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("completed")}
        >
          Mark as Completed
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDeleteTrip}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Trip
        </Button>
      </div>

      {/* Budget Alert */}
      {trip.budget && budgetUsed > 90 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Warning: You've used {budgetUsed.toFixed(1)}% of your budget!</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expenses</h3>
            <Button onClick={() => setShowExpenseForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          <div className="grid gap-4">
            {tripExpenses.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No expenses recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              tripExpenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h4 className="font-semibold">{expense.description}</h4>
                      <p className="text-sm text-muted-foreground">{expense.category}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(expense.date), "MMM dd, yyyy")}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">${expense.amount.toLocaleString()}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingExpense(expense)
                          setShowExpenseForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <Button onClick={() => setShowTaskForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <div className="grid gap-4">
            {tripTasks.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No tasks created yet</p>
                </CardContent>
              </Card>
            ) : (
              tripTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleToggleTask(task.id, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <div>
                        <h4 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h4>
                        {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTask(task)
                          setShowTaskForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={getStatusColor(trip.status)}>{getStatusText(trip.status)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>
                    {Math.ceil(
                      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenses:</span>
                  <span>${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget Remaining:</span>
                  <span>${((trip.budget || 0) - totalExpenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks Completed:</span>
                  <span>
                    {completedTasks}/{tripTasks.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Currency Info Box - Redesigned */}
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
                    <div className="text-3xl font-bold mt-1">{trip.homeCurrency}</div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Trip Currency</div>
                    <div className="text-3xl font-bold mt-1">{trip.currency}</div>
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
                  disabled={!canRefreshRates || isRatesLoading}
                  className="w-full bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isRatesLoading ? "Refreshing..." : "Refresh Rates"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => setShowExpenseForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
                <Button className="w-full bg-transparent" variant="outline" onClick={() => setShowTaskForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/dashboard/journal")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Write Journal Entry
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          tripId={trip.id}
          expense={editingExpense}
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onCancel={() => {
            setShowExpenseForm(false)
            setEditingExpense(null)
          }}
        />
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          tripId={trip.id}
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
