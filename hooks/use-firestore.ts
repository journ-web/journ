"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import * as FirestoreService from "@/lib/firestore-service"
import type { Trip, Task, Expense, Notification } from "@/types"

// Hook for trips
export const useTrips = () => {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTrips = async () => {
    if (!user) {
      setTrips([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await FirestoreService.getTrips(user.uid)
      if (result.success) {
        setTrips(result.data)
      } else {
        setError(new Error(String(result.error)))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [user])

  const addTrip = async (tripData: Partial<Trip>) => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const result = await FirestoreService.createTrip(user.uid, tripData)
      if (result.success) {
        await fetchTrips() // Refresh trips after adding
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const updateTrip = async (tripId: string, tripData: Partial<Trip>) => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const result = await FirestoreService.updateTrip(user.uid, tripId, tripData)
      if (result.success) {
        await fetchTrips() // Refresh trips after updating
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const deleteTrip = async (tripId: string) => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const result = await FirestoreService.deleteTrip(user.uid, tripId)
      if (result.success) {
        await fetchTrips() // Refresh trips after deleting
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  return { trips, loading, error, addTrip, updateTrip, deleteTrip, refreshTrips: fetchTrips }
}

// Hook for tasks
export const useTasks = (tripId?: string) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = async () => {
    if (!user || !tripId) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await FirestoreService.getTasks(user.uid, tripId)
      if (result.success) {
        setTasks(result.data)
      } else {
        setError(new Error(String(result.error)))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tripId) {
      fetchTasks()
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [user, tripId])

  const addTask = async (taskData: Partial<Task>) => {
    if (!user || !tripId) return { success: false, error: "User not authenticated or trip not selected" }

    try {
      const result = await FirestoreService.createTask(user.uid, tripId, taskData)
      if (result.success) {
        await fetchTasks() // Refresh tasks after adding
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const updateTask = async (taskId: string, taskData: Partial<Task>) => {
    if (!user || !tripId) return { success: false, error: "User not authenticated or trip not selected" }

    try {
      const result = await FirestoreService.updateTask(user.uid, tripId, taskId, taskData)
      if (result.success) {
        await fetchTasks() // Refresh tasks after updating
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!user || !tripId) return { success: false, error: "User not authenticated or trip not selected" }

    try {
      const result = await FirestoreService.deleteTask(user.uid, tripId, taskId)
      if (result.success) {
        await fetchTasks() // Refresh tasks after deleting
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  return { tasks, loading, error, addTask, updateTask, deleteTask, refreshTasks: fetchTasks }
}

// Hook for expenses
export const useExpenses = (tripId?: string) => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExpenses = async () => {
    if (!user || !tripId) {
      setExpenses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await FirestoreService.getExpenses(user.uid, tripId)
      if (result.success) {
        setExpenses(result.data)
      } else {
        setError(new Error(String(result.error)))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tripId) {
      fetchExpenses()
    } else {
      setExpenses([])
      setLoading(false)
    }
  }, [user, tripId])

  const addExpense = async (expenseData: Partial<Expense>) => {
    if (!user || !tripId) return { success: false, error: "User not authenticated or trip not selected" }

    try {
      const result = await FirestoreService.createExpense(user.uid, tripId, expenseData)
      if (result.success) {
        await fetchExpenses() // Refresh expenses after adding
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const updateExpense = async (expenseId: string, expenseData: Partial<Expense>) => {
    if (!user || !tripId) return { success: false, error: "User not authenticated or trip not selected" }

    try {
      const result = await FirestoreService.updateExpense(user.uid, tripId, expenseId, expenseData)
      if (result.success) {
        await fetchExpenses() // Refresh expenses after updating
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (!user || !tripId) return { success: false, error: "User not authenticated or trip not selected" }

    try {
      const result = await FirestoreService.deleteExpense(user.uid, tripId, expenseId)
      if (result.success) {
        await fetchExpenses() // Refresh expenses after deleting
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense, refreshExpenses: fetchExpenses }
}

// Hook for notifications
export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await FirestoreService.getNotifications(user.uid)
      if (result.success) {
        setNotifications(result.data)
      } else {
        setError(new Error(String(result.error)))
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const addNotification = async (notificationData: Partial<Notification>) => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const result = await FirestoreService.createNotification(user.uid, notificationData)
      if (result.success) {
        await fetchNotifications() // Refresh notifications after adding
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const updateNotification = async (notificationId: string, notificationData: Partial<Notification>) => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const result = await FirestoreService.updateNotification(user.uid, notificationId, notificationData)
      if (result.success) {
        await fetchNotifications() // Refresh notifications after updating
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const result = await FirestoreService.deleteNotification(user.uid, notificationId)
      if (result.success) {
        await fetchNotifications() // Refresh notifications after deleting
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  const markAllAsRead = async () => {
    if (!user) return { success: false, error: "User not authenticated" }

    try {
      const result = await FirestoreService.markAllNotificationsAsRead(user.uid)
      if (result.success) {
        await fetchNotifications() // Refresh notifications after marking all as read
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      return { success: false, error: errorMessage }
    }
  }

  return {
    notifications,
    loading,
    error,
    addNotification,
    updateNotification,
    deleteNotification,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  }
}
