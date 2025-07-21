"use client"

import { useParams } from "next/navigation"
import { useTrips } from "@/hooks/use-trips"
import { TripDetail } from "@/components/dashboard/trip-detail/trip-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function TripDetailPage() {
  const params = useParams()
  const tripId = params.id as string
  const { trips, loading, error } = useTrips()

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading trip details: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const trip = trips.find((t) => t.id === tripId)

  if (!trip) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Trip not found. Please check the URL or go back to your trips list.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <TripDetail trip={trip} />
}
