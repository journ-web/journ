"use client"

import { useState, useEffect } from "react"
import { isValid } from "date-fns"
import type { TodoTask, TaskCategory, TaskPriority, TaskStatus } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateInput } from "@/components/dashboard/todo/date-input"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Omit<TodoTask, "id" | "createdAt"> | TodoTask) => Promise<void> | void
  initialTask?: TodoTask
}

export function TaskForm({ open, onOpenChange, onSubmit, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date())
  const [category, setCategory] = useState<TaskCategory>("Personal")
  const [priority, setPriority] = useState<TaskPriority>("None")
  const [status, setStatus] = useState<TaskStatus>("Pending")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Reset form when dialog opens/closes or initialTask changes
  useEffect(() => {
    if (open) {
      if (initialTask) {
        setTitle(initialTask.title)
        setDescription(initialTask.description || "")
        setDueDate(new Date(initialTask.dueDate))
        setCategory(initialTask.category)
        setPriority(initialTask.priority)
        setStatus(initialTask.status)
      } else {
        // Default values for new task
        setTitle("")
        setDescription("")
        setDueDate(new Date())
        setCategory("Personal")
        setPriority("None")
        setStatus("Pending")
      }
      setErrors({})
    }
  }, [open, initialTask])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required"
      toast({
        title: "Date Required",
        description: "Please enter a valid due date for the task",
        variant: "destructive",
      })
    } else if (!isValid(dueDate)) {
      newErrors.dueDate = "Please enter a valid date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the handleSubmit function to properly format the date
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      // Ensure dueDate is properly formatted as ISO string
      const taskData = {
        title,
        description: description.trim() || "",
        dueDate: dueDate instanceof Date ? dueDate.toISOString() : dueDate || new Date().toISOString(),
        category,
        priority,
        status,
      }

      if (initialTask) {
        await onSubmit({ ...taskData, id: initialTask.id, createdAt: initialTask.createdAt })
      } else {
        await onSubmit(taskData)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting task:", error)
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    setDueDate(date)
    if (date) {
      setErrors((prev) => ({ ...prev, dueDate: "" }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>{initialTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {initialTask ? "Update the details of your task below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="required">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or details about this task"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dueDate" className="required">
                Due Date
              </Label>
              <DateInput
                id="dueDate"
                date={dueDate}
                onDateChange={handleDateChange}
                error={errors.dueDate}
                required={true}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as TaskCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{initialTask ? "Update Task" : "Add Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
