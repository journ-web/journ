"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTrips } from "@/hooks/use-trips"
import { TripList } from "@/components/dashboard/trip-planner/trip-list"
import { MapPin, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function CompletedTripsPage() {
  const { trips, loading } = useTrips()
  const [searchQuery, setSearchQuery] = useState("")

  const completedTrips = trips
    .filter((trip) => trip.status === "completed" || trip.status === "cancelled")
    .filter((trip) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return trip.name.toLowerCase().includes(query) || trip.destination.toLowerCase().includes(query)
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Completed Trips</h1>
          <p className="text-muted-foreground">Review your past adventures</p>
        </div>
        <div className="relative flex-1 md:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-[300px] animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : completedTrips.length > 0 ? (
        <TripList trips={completedTrips} activeTab="completed" />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No completed trips yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Your completed trips will appear here once you've finished your adventures.
          </p>
        </div>
      )}
    </div>
  )
}
