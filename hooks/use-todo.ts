"use client"

import { useState, useEffect } from "react"
import type { TodoTask } from "@/types/todo"

// This is a client-side only hook that manages todo tasks
// In a real application, this would connect to a backend service
export function useTodo() {
  const [tasks, setTasks] = useState<TodoTask[]>([])
  const [loading, setLoading] = useState(true)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadTasks = () => {
      try {
        const savedTasks = localStorage.getItem("todoTasks")
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("todoTasks", JSON.stringify(tasks))
    }
  }, [tasks, loading])

  // Add a new task
  const addTask = (task: Omit<TodoTask, "id" | "createdAt">) => {
    const newTask: TodoTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    return newTask
  }

  // Update an existing task
  const updateTask = (updatedTask: TodoTask) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    return updatedTask
  }

  // Delete a task
  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  // Toggle task status
  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          let newStatus: TodoTask["status"] = "Pending"

          // Cycle through statuses: Pending -> In Progress -> Completed -> Pending
          if (task.status === "Pending") newStatus = "In Progress"
          else if (task.status === "In Progress") newStatus = "Completed"
          else if (task.status === "Completed") newStatus = "Pending"

          return { ...task, status: newStatus }
        }
        return task
      }),
    )
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
