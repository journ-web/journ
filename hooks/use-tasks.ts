"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createTask, updateTask, deleteTask, subscribeToTasks } from "@/lib/firebase-service"
import type { Task } from "@/types"

export function useTasks(tripId: string | null) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !tripId) {
      setTasks({})
      setLoading(false)
      return () => {}
    }

    setLoading(true)

    // Subscribe to tasks collection
    const unsubscribe = subscribeToTasks(user.uid, tripId, (fetchedTasks) => {
      setTasks(fetchedTasks)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [user, tripId])

  const addTask = async (taskData: Omit<Task, "id" | "completed">): Promise<boolean> => {
    if (!user) return false

    try {
      // Normal online task creation
      await createTask(user.uid, tripId, taskData)
      return true
    } catch (error) {
      console.error("Error adding task:", error)
      return false
    }
  }

  const toggleTaskCompletion = useCallback(
    async (date: string, taskId: string, completed: boolean) => {
      if (!user || !tripId) return false

      try {
        setError(null)
        await updateTask(user.uid, tripId, taskId, { completed })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update task"
        setError(errorMessage)
        return false
      }
    },
    [user, tripId],
  )

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!user || !tripId) return false

      try {
        setError(null)
        await deleteTask(user.uid, tripId, taskId)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete task"
        setError(errorMessage)
        return false
      }
    },
    [user, tripId],
  )

  const updateTaskDetails = useCallback(
    async (taskId: string, taskData: Partial<Task>) => {
      if (!user || !tripId) return false

      try {
        setError(null)
        await updateTask(user.uid, tripId, taskId, taskData)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update task"
        setError(errorMessage)
        return false
      }
    },
    [user, tripId],
  )

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleTaskCompletion,
    removeTask,
    updateTaskDetails,
  }
}
