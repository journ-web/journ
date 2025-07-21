"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { TripPlanner } from "@/components/dashboard/trip-planner/trip-planner"
import { useTrips } from "@/hooks/use-trips"

export default function TripsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tripId = searchParams.get("id")
  const { trips, loading } = useTrips()

  useEffect(() => {
    // If no trip ID is provided, check if there's an ongoing trip
    if (!tripId && !loading) {
      const ongoingTrips = trips.filter((trip) => trip.status === "ongoing")

      if (ongoingTrips.length > 0) {
        // If there's an ongoing trip, redirect to it
        router.push(`/dashboard/trips?id=${ongoingTrips[0].id}`)
      } else {
        // Otherwise redirect to ongoing trips page
        router.push("/dashboard/trips/ongoing")
      }
    }
  }, [tripId, router, trips, loading])

  // If a trip ID is provided, show the trip detail view
  if (tripId) {
    return <TripPlanner />
  }

  // This will only show briefly during the redirect
  return null
}
