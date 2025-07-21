"use client"

import { useState, useMemo } from "react"
import { X, Plus, Search, Filter, Target, CheckCircle2, Clock } from "lucide-react"
import { format, parse, isValid, isSameDay, isToday } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useFirestoreTodos } from "@/hooks/use-firestore-todos"
import type { TodoTask } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskCard } from "@/components/dashboard/todo/task-card"
import { TaskForm } from "@/components/dashboard/todo/task-form"
import { DateInput } from "@/components/dashboard/todo/date-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TaskStatus } from "@/types/todo" // Corrected import path for TaskStatus

export default function TodoPage() {
  const { toast } = useToast()
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTaskStatus } = useFirestoreTodos()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [monthYearFilter, setMonthYearFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TodoTask | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  // Generate available month/year options from tasks
  const monthYearOptions = useMemo(() => {
    const options = new Set<string>()

    tasks.forEach((task) => {
      const date = new Date(task.dueDate)
      if (isValid(date)) {
        options.add(format(date, "MMMM yyyy"))
      }
    })

    return Array.from(options).sort((a, b) => {
      const dateA = parse(a, "MMMM yyyy", new Date())
      const dateB = parse(b, "MMMM yyyy", new Date())
      return dateA.getTime() - dateB.getTime()
    })
  }, [tasks])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

        // Category filter
        const matchesCategory = categoryFilter === "all" || task.category === categoryFilter

        // Priority filter
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

        // Status filter
        const matchesStatus = statusFilter === "all" || task.status === statusFilter

        // Month/Year filter
        let matchesMonthYear = true
        if (monthYearFilter !== "all") {
          const taskDate = new Date(task.dueDate)
          const taskMonthYear = format(taskDate, "MMMM yyyy")
          matchesMonthYear = taskMonthYear === monthYearFilter
        }

        // Specific date filter
        let matchesDate = true
        if (dateFilter) {
          const taskDate = new Date(task.dueDate)
          matchesDate = isSameDay(taskDate, dateFilter)
        }

        return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesMonthYear && matchesDate
      })
      .sort((a, b) => {
        // Sort by createdAt (latest first - descending)
        const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (createdAtDiff !== 0) return createdAtDiff

        // Then sort by due date (earliest first)
        const dateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        if (dateDiff !== 0) return dateDiff

        // Then sort by status (Pending first, then In Progress, then Completed)
        const statusOrder = { Pending: 0, "In Progress": 1, Completed: 2 }
        const statusDiff = statusOrder[a.status] - statusOrder[b.status]
        if (statusDiff !== 0) return statusDiff

        // Then sort by priority (High first, then Medium, then Low, then None)
        const priorityOrder = { High: 0, Medium: 1, Low: 2, None: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }, [tasks, searchQuery, categoryFilter, priorityFilter, statusFilter, monthYearFilter, dateFilter])

  // Group tasks by specific date
  const groupedTasks = useMemo(() => {
    const groups: Record<string, TodoTask[]> = {}

    filteredTasks.forEach((task) => {
      const date = new Date(task.dueDate)
      const dateKey = format(date, "yyyy-MM-dd")
      const dateDisplay = format(date, "d MMM yyyy")

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(task)
    })

    // Sort the groups by date (latest first - descending)
    return Object.entries(groups)
      .sort(([a], [b]) => {
        return b.localeCompare(a) // Sort in descending order for yyyy-MM-dd format
      })
      .map(([dateKey, tasks]) => ({
        dateKey,
        dateDisplay: format(new Date(dateKey), "d MMM yyyy"),
        isToday: isToday(new Date(dateKey)),
        tasks,
      }))
  }, [filteredTasks])

  // Handle adding a new task
  const handleAddTask = async (taskData: Omit<TodoTask, "id" | "createdAt">) => {
    try {
      console.log("Adding task with data:", taskData)
      const result = await addTask(taskData)

      if (result) {
        toast({
          title: "Task added",
          description: "Your task has been successfully added.",
        })
      } else {
        console.error("Failed to add task: No result returned")
        toast({
          title: "Error",
          description: "Failed to add task. Please check the console for more details.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: `Failed to add task: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // Handle updating an existing task
  const handleUpdateTask = async (taskData: TodoTask) => {
    try {
      const result = await updateTask(taskData)
      if (result) {
        toast({
          title: "Task updated",
          description: "Your task has been successfully updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update task. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: `Failed to update task: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // Handle deleting a task
  const handleDeleteTask = async (taskId: string) => {
    const result = await deleteTask(taskId)
    if (result) {
      toast({
        title: "Task deleted",
        description: "Your task has been successfully deleted.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle editing a task
  const handleEditTask = (task: TodoTask) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  // Handle toggling task status
  const handleToggleStatus = async (taskId: string) => {
    await toggleTaskStatus(taskId)
  }

  // Handle form submission (add or update)
  const handleFormSubmit = async (taskData: Omit<TodoTask, "id" | "createdAt"> | TodoTask) => {
    if ("id" in taskData) {
      await handleUpdateTask(taskData as TodoTask)
    } else {
      await handleAddTask(taskData)
    }
  }

  // Handle updating task status
  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const updatedTask = { ...task, status }
      await updateTask(updatedTask)
    }
  }

  // Handle date filter change
  const handleDateFilterChange = (date: Date | undefined) => {
    setDateFilter(date)
    if (date) {
      setMonthYearFilter("all")
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setPriorityFilter("all")
    setStatusFilter("all")
    setMonthYearFilter("all")
    setDateFilter(undefined)
  }

  // Check if any filters are active
  const hasActiveFilters =
    categoryFilter !== "all" ||
    priorityFilter !== "all" ||
    statusFilter !== "all" ||
    monthYearFilter !== "all" ||
    dateFilter

  // Calculate stats
  const completedTasks = tasks.filter((task) => task.status === "Completed").length
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your travel tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground">
      {" "}
      {/* Removed min-h-screen */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Simple Header */}
        <div className="bg-card text-card-foreground rounded-lg p-6 mb-8 border border-border">
          <div className="flex flex-col md:flex-row lg:items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Travel Tasks</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Organize your travel plans, track your adventures, and never miss a moment.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{completedTasks} Completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{pendingTasks + inProgressTasks} Active Tasks</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingTask(undefined)
                setIsFormOpen(true)
              }}
              className="mt-6 lg:mt-0 px-6 py-3"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Travel Task
            </Button>
          </div>
        </div>

        {/* Simple Stats Cards */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                    <p className="text-3xl font-bold text-foreground">{pendingTasks}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold text-foreground">{inProgressTasks}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-foreground">{completedTasks}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Simple Search and Filters */}
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your travel tasks..."
                className="pl-10 h-12 border border-border bg-input text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-9 w-9"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              className="sm:w-auto h-12 border border-border bg-transparent"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && <span className="ml-2 rounded-full bg-primary w-2 h-2"></span>}
            </Button>
          </div>

          {showFilters && (
            <Card className="border border-border bg-card text-card-foreground">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month & Year</label>
                    <Select
                      value={monthYearFilter}
                      onValueChange={(value) => {
                        setMonthYearFilter(value)
                        if (value !== "all") {
                          setDateFilter(undefined)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Dates" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        <SelectItem value="all">All Months</SelectItem>
                        {monthYearOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">Specific Date</label>
                    <DateInput
                      date={dateFilter}
                      onDateChange={handleDateFilterChange}
                      placeholder="DD/MM/YYYY"
                      clearable={true}
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Selected Date Filter Display */}
        {(dateFilter || monthYearFilter !== "all") && (
          <div className="flex items-center justify-between bg-accent text-accent-foreground rounded-lg p-4 mb-8 border border-border">
            <span className="font-medium">
              {dateFilter
                ? `Viewing tasks for: ${format(dateFilter, "d MMMM yyyy")}`
                : `Viewing tasks for: ${monthYearFilter}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFilter(undefined)
                setMonthYearFilter("all")
              }}
              className="text-accent-foreground hover:text-foreground"
            >
              Show All Dates
            </Button>
          </div>
        )}

        {/* Task List Grouped by Date */}
        {groupedTasks.length > 0 ? (
          <div className="space-y-8">
            {groupedTasks.map(({ dateKey, dateDisplay, isToday, tasks }) => (
              <div key={dateKey} className="space-y-4">
                <div className="flex items-center border-b border-border pb-3">
                  <h2 className="text-2xl font-bold text-foreground">{dateDisplay}</h2>
                  {isToday && (
                    <Badge
                      variant="outline"
                      className="ml-3 bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                    >
                      Today
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onToggleStatus={handleToggleStatus}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-muted flex items-center justify-center border border-border">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                {tasks.length === 0
                  ? "Ready to Plan Your Adventure?"
                  : dateFilter
                    ? `No tasks scheduled for ${format(dateFilter, "d MMMM yyyy")}`
                    : monthYearFilter !== "all"
                      ? `No tasks scheduled for ${monthYearFilter}`
                      : "No matching tasks"}
              </h3>
              <p className="text-muted-foreground mb-8">
                {tasks.length === 0
                  ? "Start organizing your travel plans by creating your first task."
                  : dateFilter
                    ? `There are no tasks scheduled for ${format(dateFilter, "d MMMM yyyy")}.`
                    : monthYearFilter !== "all"
                      ? `There are no tasks scheduled for ${monthYearFilter}.`
                      : "No tasks match your current filters."}
              </p>
              <Button
                onClick={() => {
                  setEditingTask(undefined)
                  setIsFormOpen(true)
                }}
                className="px-8 py-3"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Task
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Add/Edit Task Modal */}
      <TaskForm open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleFormSubmit} initialTask={editingTask} />
    </div>
  )
}
