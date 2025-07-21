"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createExpense, updateExpense, deleteExpense, subscribeToExpenses } from "@/lib/firebase-service"
import type { Expense } from "@/types"

export function useExpenses(tripId: string | null) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !tripId) {
      setExpenses([])
      setLoading(false)
      return () => {}
    }

    setLoading(true)

    // Subscribe to expenses collection
    const unsubscribe = subscribeToExpenses(user.uid, tripId, (fetchedExpenses) => {
      setExpenses(fetchedExpenses)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [user, tripId])

  const addExpense = useCallback(
    async (expenseData: Omit<Expense, "id" | "tripId" | "createdAt">): Promise<boolean> => {
      if (!user) return false

      try {
        // Normal online expense creation
        const newExpense = await createExpense(user.uid, tripId, expenseData)
        return true
      } catch (error) {
        console.error("Error adding expense:", error)
        return false
      }
    },
    [user, tripId],
  )

  const updateExpenseDetails = useCallback(
    async (expenseId: string, expenseData: Partial<Expense>) => {
      if (!user || !tripId) return false

      try {
        setError(null)
        // Note: expenseData should already contain both amount (in trip currency)
        // and amountInHomeCurrency (converted amount) if they were updated
        await updateExpense(user.uid, tripId, expenseId, expenseData)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update expense"
        setError(errorMessage)
        return false
      }
    },
    [user, tripId],
  )

  const removeExpense = useCallback(
    async (expenseId: string) => {
      if (!user || !tripId) return false

      try {
        setError(null)
        await deleteExpense(user.uid, tripId, expenseId)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete expense"
        setError(errorMessage)
        return false
      }
    },
    [user, tripId],
  )

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpenseDetails,
    removeExpense,
  }
}
