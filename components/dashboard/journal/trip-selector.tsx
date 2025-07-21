"use client"

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTrips } from "@/hooks/use-trips"
import { MapPin, ChevronDown, Calendar } from "lucide-react"
import { format } from "date-fns"

interface TripSelectorProps {
  selectedTripId: string | null
  onTripSelect: (tripId: string | null) => void
}

export function TripSelector({ selectedTripId, onTripSelect }: TripSelectorProps) {
  const { trips, loading } = useTrips()

  if (loading) {
    return (
      <Card className="bg-background border border-border">
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-4 w-20 sm:w-24 mb-2" />
          <Skeleton className="h-4 w-48 sm:w-64 mb-4" />
          <Skeleton className="h-10 sm:h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId)

  return (
    <Card className="bg-background border border-border">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-medium text-foreground mb-1">Select Trip</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Choose a trip to view and manage your travel memories
            </p>
          </div>

          <Select
            value={selectedTripId || "none"}
            onValueChange={(value) => onTripSelect(value === "none" ? null : value)}
          >
            <SelectTrigger className="w-full h-12 sm:h-14 bg-accent text-accent-foreground border border-border">
              <div className="flex items-center gap-2 sm:gap-3 text-left min-w-0 flex-1">
                {selectedTrip ? (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground truncate text-sm sm:text-base">
                        {selectedTrip.destination}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {format(new Date(selectedTrip.startDate), "MMM d")} -{" "}
                          {format(new Date(selectedTrip.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm sm:text-base">
                    Select a trip to start journaling...
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border border-border max-h-60 overflow-y-auto">
              <SelectItem value="none" className="hover:bg-accent hover:text-accent-foreground py-3">
                <span className="text-muted-foreground text-sm sm:text-base">No trip selected</span>
              </SelectItem>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id} className="hover:bg-accent hover:text-accent-foreground py-3">
                  <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{trip.destination}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>
                          {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTrip && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                    {selectedTrip.destination}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    You can add memories for any date between{" "}
                    <span className="font-medium">
                      {format(new Date(selectedTrip.startDate), "MMM d")} -{" "}
                      {format(new Date(selectedTrip.endDate), "MMM d, yyyy")}
                    </span>
                  </p>
                  {selectedTrip.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {selectedTrip.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
