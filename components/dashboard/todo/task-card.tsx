"use client"

import { useState } from "react"
import { format, isPast, isToday } from "date-fns"
import { Edit, Trash2, Calendar, AlertCircle, MapPin, Plane, Camera, Briefcase } from "lucide-react"
import type { TodoTask, TaskStatus } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: TodoTask
  onEdit: (task: TodoTask) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string) => void
  onUpdateStatus?: (taskId: string, status: TaskStatus) => void
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus, onUpdateStatus }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const isCompleted = task.status === "Completed"
  const dueDate = new Date(task.dueDate)
  const isPastDue = isPast(dueDate) && !isToday(dueDate) && !isCompleted

  const handleStatusChange = (status: TaskStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(task.id, status)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      case "Medium":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
      case "Low":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "Pending":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Travel":
        return <Plane className="h-3 w-3" />
      case "Personal":
        return <Camera className="h-3 w-3" />
      case "Work":
        return <Briefcase className="h-3 w-3" />
      case "Urgent":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <MapPin className="h-3 w-3" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Travel":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "Personal":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800"
      case "Work":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
      case "Urgent":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
    }
  }

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case "Travel":
        return "border-blue-500"
      case "Personal":
        return "border-purple-500"
      case "Work":
        return "border-gray-500"
      case "Urgent":
        return "border-red-500"
      default:
        return "border-emerald-500"
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center py-3 px-4 border-b border-border last:border-b-0 bg-card text-card-foreground transition-colors hover:bg-muted/50",
        getCategoryBorderColor(task.category),
        isCompleted && "opacity-75",
      )}
      style={{ borderLeftWidth: "4px" }} // Apply left border for category stripe
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggleStatus(task.id)}
        className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 shrink-0"
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      />
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 ml-3 min-w-0">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-base font-semibold line-clamp-1 text-foreground",
              isCompleted && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className={cn("text-xs text-muted-foreground line-clamp-2", isCompleted && "line-through")}>
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <Badge variant="outline" className={cn("border text-xs px-2 py-0.5", getCategoryColor(task.category))}>
              {getCategoryIcon(task.category)}
              <span className="ml-1">{task.category}</span>
            </Badge>
            {task.priority !== "None" && (
              <Badge variant="outline" className={cn("border text-xs px-2 py-0.5", getPriorityColor(task.priority))}>
                {task.priority} Priority
              </Badge>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3 text-primary" />
              <span className={cn(isPastDue && "text-destructive font-medium")}>
                {isToday(dueDate) ? "Today" : format(dueDate, "MMM d, yyyy")}
              </span>
              {isPastDue && <AlertCircle className="ml-1 h-3 w-3 text-destructive" />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dropdown */}
          <Select value={task.status} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
            <SelectTrigger className={cn("h-7 w-[110px] text-xs", getStatusColor(task.status))}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground">
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <span className="sr-only">Open menu</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                >
                  <path
                    d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-popover text-popover-foreground">
              <DropdownMenuItem onClick={() => onEdit(task)} className="text-foreground text-sm">
                <Edit className="mr-2 h-3 w-3" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive text-sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                {isDeleting ? "Deleting..." : "Delete Task"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
