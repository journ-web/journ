"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { subscribeToExpenses } from "@/lib/firebase-service"
import type { Expense, Trip } from "@/types"

export function useAllExpenses(trips: Trip[]) {
  const { user } = useAuth()
  const [allExpenses, setAllExpenses] = useState<
    (Expense & { tripId: string; tripName: string; tripHomeCurrency: string })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || trips.length === 0) {
      setAllExpenses([])
      setLoading(false)
      return () => {}
    }

    setLoading(true)
    setError(null)

    // Keep track of all subscriptions
    const subscriptions: (() => void)[] = []

    // Create a map to store expenses by trip ID
    const expensesByTrip: Record<string, (Expense & { tripId: string; tripName: string; tripHomeCurrency: string })[]> =
      {}

    // Initialize the map with empty arrays for each trip
    trips.forEach((trip) => {
      expensesByTrip[trip.id] = []
    })

    // Function to update the combined expenses array
    const updateAllExpenses = () => {
      const combinedExpenses = Object.values(expensesByTrip).flat()
      setAllExpenses(combinedExpenses)

      // Only set loading to false when we have processed all trips
      if (Object.keys(expensesByTrip).length === trips.length) {
        setLoading(false)
      }
    }

    // Subscribe to expenses for each trip
    trips.forEach((trip) => {
      try {
        const unsubscribe = subscribeToExpenses(user.uid, trip.id, (fetchedExpenses) => {
          // Add trip information to each expense
          const expensesWithTripInfo = fetchedExpenses.map((expense) => ({
            ...expense,
            tripId: trip.id,
            tripName: trip.name,
            tripHomeCurrency: trip.homeCurrency,
          }))

          // Update the expenses for this trip
          expensesByTrip[trip.id] = expensesWithTripInfo

          // Update the combined expenses
          updateAllExpenses()
        })

        subscriptions.push(unsubscribe)
      } catch (err) {
        console.error(`Error subscribing to expenses for trip ${trip.id}:`, err)
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch expenses"
        setError(errorMessage)
      }
    })

    // Cleanup function to unsubscribe from all subscriptions
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe())
    }
  }, [user, trips])

  return {
    allExpenses,
    loading,
    error,
  }
}
