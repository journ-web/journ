"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createTodo, getTodos, updateTodo, deleteTodo } from "@/lib/firestore-service"
import type { TodoTask, TaskStatus } from "@/types/todo"

export function useFirestoreTodos() {
  const [tasks, setTasks] = useState<TodoTask[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load tasks from Firestore on mount
  useEffect(() => {
    const loadTasks = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await getTodos(user.uid)
        if (result.success) {
          setTasks(result.data)
        } else {
          console.error("Error loading tasks:", result.error)
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [user?.uid])

  // Update the addTask function to properly format the data for Firestore
  const addTask = async (task: Omit<TodoTask, "id" | "createdAt">) => {
    if (!user?.uid) {
      console.error("Cannot add task: No authenticated user")
      return null
    }

    try {
      // Format the date as ISO string if it's not already
      const formattedTask = {
        ...task,
        dueDate: typeof task.dueDate === "string" ? task.dueDate : task.dueDate.toISOString(),
        status: task.status || "Pending",
        priority: task.priority || "None",
        category: task.category || "Personal",
      }

      console.log("Adding task with data:", formattedTask)
      const result = await createTodo(user.uid, formattedTask)

      if (!result.success) {
        console.error("Firestore error adding task:", result.error)
        return null
      }

      if (result.success && result.id) {
        const newTask: TodoTask = {
          ...formattedTask,
          id: result.id,
          createdAt: new Date().toISOString(),
        }
        setTasks((prev) => [...prev, newTask])
        return newTask
      }
      return null
    } catch (error) {
      console.error("Error adding task:", error)
      return null
    }
  }

  // Update the updateTask function to properly format the data
  const updateTask = async (updatedTask: TodoTask) => {
    if (!user?.uid) {
      console.error("Cannot update task: No authenticated user")
      return null
    }

    try {
      const { id, ...taskData } = updatedTask

      // Format the date as ISO string if it's not already
      const formattedTaskData = {
        ...taskData,
        dueDate: typeof taskData.dueDate === "string" ? taskData.dueDate : taskData.dueDate.toISOString(),
        updatedAt: new Date().toISOString(),
      }

      console.log("Updating task with data:", id, formattedTaskData)
      const result = await updateTodo(user.uid, id, formattedTaskData)

      if (!result.success) {
        console.error("Firestore error updating task:", result.error)
        return null
      }

      setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
      return updatedTask
    } catch (error) {
      console.error("Error updating task:", error)
      return null
    }
  }

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!user?.uid) return false

    try {
      const result = await deleteTodo(user.uid, taskId)
      if (result.success) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId))
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting task:", error)
      return false
    }
  }

  // Toggle task status
  const toggleTaskStatus = async (taskId: string) => {
    if (!user?.uid) return false

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return false

    let newStatus: TaskStatus = "Pending"

    // Cycle through statuses: Pending -> In Progress -> Completed -> Pending
    if (task.status === "Pending") newStatus = "In Progress"
    else if (task.status === "In Progress") newStatus = "Completed"
    else if (task.status === "Completed") newStatus = "Pending"

    try {
      const result = await updateTodo(user.uid, taskId, { status: newStatus })
      if (result.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
        return true
      }
      return false
    } catch (error) {
      console.error("Error toggling task status:", error)
      return false
    }
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  }
}
