"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTrips } from "@/hooks/use-trips"

export default function OngoingTripsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { trips, loading } = useTrips()

  // Filter ongoing trips
  const ongoingTrips = trips.filter((trip) => trip.status === "ongoing")

  // Automatically redirect to the trip detail page if there's an ongoing trip
  useEffect(() => {
    if (!loading && ongoingTrips.length > 0) {
      // Redirect to the first ongoing trip's detail page
      router.push(`/dashboard/trips?id=${ongoingTrips[0].id}`)
    }
  }, [loading, ongoingTrips, router])

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // No ongoing trips
  if (ongoingTrips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">No ongoing trips</h2>
        <p className="text-muted-foreground mb-6">You don't have any ongoing trips at the moment.</p>
        <Button onClick={() => router.push("/dashboard/trips/planned")}>View Planned Trips</Button>
      </div>
    )
  }

  // This will only show briefly before the redirect happens
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Redirecting to your ongoing trip...</h2>
        <p className="text-muted-foreground">Please wait a moment</p>
      </div>
    </div>
  )
}
