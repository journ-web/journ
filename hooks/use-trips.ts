"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createTrip, updateTrip, deleteTrip, subscribeToTrips, subscribeToFullTripData } from "@/lib/firebase-service"
import type { Trip, TripStatus } from "@/types"

export function useTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Clear trips and set loading to false if no user
    if (!user) {
      console.log("useTrips: No user, clearing trips")
      setTrips([])
      setLoading(false)
      setInitialized(true)
      return () => {}
    }

    // Set loading to true when starting to fetch
    console.log("useTrips: Starting to fetch trips for user:", user.uid)
    setLoading(true)
    setError(null)

    // Subscribe to trips collection
    const unsubscribe = subscribeToTrips(
      user.uid,
      (fetchedTrips) => {
        console.log(`useTrips: Received ${fetchedTrips.length} trips from Firestore`)
        setTrips(fetchedTrips)
        setLoading(false)
        setInitialized(true)
      },
      (err) => {
        console.error("Error fetching trips:", err)
        setError("Failed to load trips. Please try again.")
        setLoading(false)
        setInitialized(true)
      },
    )

    return () => {
      console.log("useTrips: Unsubscribing from trips")
      unsubscribe()
    }
  }, [user])

  // Add trip with validation
  const addTrip = useCallback(
    async (tripData: Omit<Trip, "id" | "tasks" | "expenses">) => {
      if (!user) return null

      try {
        setError(null)

        // Check if there are already 3 planned trips
        const plannedTrips = trips.filter((trip) => trip.status === "planned")
        if (plannedTrips.length >= 3 && tripData.status === "planned") {
          setError("You've reached the limit of 3 planned trips. Complete or delete a trip to add a new one.")
          return null
        }

        // Check if there's already an ongoing trip
        const ongoingTrips = trips.filter((trip) => trip.status === "ongoing")
        if (ongoingTrips.length > 0 && tripData.status === "ongoing") {
          setError("You already have an ongoing trip. Please complete it before starting a new one.")
          return null
        }

        const newTrip = await createTrip(user.uid, tripData)
        return newTrip
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add trip"
        setError(errorMessage)
        return null
      }
    },
    [user, trips],
  )

  // Update trip status with validation
  const updateTripStatus = useCallback(
    async (tripId: string, status: TripStatus) => {
      if (!user) return false

      try {
        setError(null)

        // If trying to set status to "ongoing", check if there's already an ongoing trip
        if (status === "ongoing") {
          const ongoingTrips = trips.filter((trip) => trip.status === "ongoing")
          if (ongoingTrips.length > 0 && !ongoingTrips.some((trip) => trip.id === tripId)) {
            setError("You already have an ongoing trip. Please complete it before starting a new one.")
            return false
          }
        }

        await updateTrip(user.uid, tripId, { status })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update trip status"
        setError(errorMessage)
        return false
      }
    },
    [user, trips],
  )

  const removeTrip = useCallback(
    async (tripId: string) => {
      if (!user) return false

      try {
        setError(null)
        await deleteTrip(user.uid, tripId)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete trip"
        setError(errorMessage)
        return false
      }
    },
    [user],
  )

  const updateTripDetails = useCallback(
    async (tripId: string, tripData: Partial<Trip>) => {
      if (!user) return false

      try {
        setError(null)
        await updateTrip(user.uid, tripId, tripData)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update trip"
        setError(errorMessage)
        return false
      }
    },
    [user],
  )

  return {
    trips,
    loading,
    error,
    initialized,
    addTrip,
    updateTripStatus,
    removeTrip,
    updateTripDetails,
  }
}

export function useTripDetails(tripId: string | null) {
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // New state to trigger manual refresh

  useEffect(() => {
    if (!user || !tripId) {
      setTrip(null)
      setLoading(false)
      return () => {}
    }

    setLoading(true)

    // Subscribe to full trip data
    const unsubscribe = subscribeToFullTripData(user.uid, tripId, (fetchedTrip) => {
      setTrip(fetchedTrip)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [user, tripId, refreshTrigger]) // Add refreshTrigger to dependencies

  const updateTripStatus = useCallback(
    async (status: TripStatus) => {
      if (!user || !tripId) return false

      try {
        setError(null)
        await updateTrip(user.uid, tripId, { status })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update trip status"
        setError(errorMessage)
        return false
      }
    },
    [user, tripId],
  )

  const updateTripDetails = useCallback(
    async (tripData: Partial<Trip>) => {
      if (!user || !tripId) return false

      try {
        setError(null)
        await updateTrip(user.uid, tripId, tripData)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update trip"
        setError(errorMessage)
        return false
      }
    },
    [user, tripId],
  )

  // Function to manually trigger a refresh
  const refreshTrip = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return {
    trip,
    loading,
    error,
    updateTripStatus,
    updateTripDetails,
    refreshTrip, // Expose the refresh function
  }
}
