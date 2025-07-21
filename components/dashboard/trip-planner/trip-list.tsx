"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { MapPin, CalendarIcon, Users, Briefcase, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/utils/currency"
import { useTrips } from "@/hooks/use-trips"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Trip } from "@/types/trip"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface TripListProps {
  trips: Trip[]
  activeTab: "planned" | "ongoing" | "completed"
  hasOngoingTrip?: boolean
}

export function TripList({ trips, activeTab, hasOngoingTrip = false }: TripListProps) {
  const router = useRouter()
  const { updateTripStatus, removeTrip } = useTrips()
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showOngoingAlert, setShowOngoingAlert] = useState(false)

  const handleStartTrip = async (tripId: string) => {
    // Check if there's already an ongoing trip
    if (hasOngoingTrip) {
      setShowOngoingAlert(true)
      return
    }

    await updateTripStatus(tripId, "ongoing")
    // Redirect to the trip detail page
    router.push(`/dashboard/trips?id=${tripId}`)
  }

  const handleCompleteTrip = async (tripId: string) => {
    await updateTripStatus(tripId, "completed")
  }

  const handleDeleteTrip = async () => {
    if (tripToDelete) {
      await removeTrip(tripToDelete.id)
      setTripToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (trip: Trip) => {
    setTripToDelete(trip)
    setIsDeleteDialogOpen(true)
  }

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-500"
      case "ongoing":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTripTypeIcon = (type: string) => {
    switch (type) {
      case "solo":
        return <Users className="h-4 w-4" />
      case "couple":
        return <Users className="h-4 w-4" />
      case "family":
        return <Users className="h-4 w-4" />
      case "business":
        return <Briefcase className="h-4 w-4" />
      case "friends":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <>
      {showOngoingAlert && (
        <Alert variant="warning" className="mb-6 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <div>
            <AlertTitle>Only One Ongoing Trip Allowed</AlertTitle>
            <AlertDescription>
              You already have an ongoing trip. Please complete it before starting a new one.
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {trips.map((trip) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200 group">
              <div className="absolute top-3 right-3 z-10">
                <Badge className={`${getTripStatusColor(trip.status)} text-white capitalize`}>{trip.status}</Badge>
              </div>
              <div className="relative h-40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-10"></div>
                <Image
                  src="/images/travel-hero-static.webp"
                  alt="Travel planning illustration"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 z-10 text-white max-w-[calc(100%-2rem)]">
                  <h3 className="text-xl font-bold truncate">{trip.name}</h3>
                  <div className="flex items-center mt-1 text-white/80">
                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">{trip.destination}</span>
                  </div>
                </div>
              </div>
              <CardContent className="pb-3 flex-1 pt-4">
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">
                      {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {getTripTypeIcon(trip.tripType)}
                      <span className="text-sm ml-2 truncate">
                        {trip.people} {trip.people === 1 ? "Person" : "People"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget:</span>
                    <span className="font-medium">{formatCurrency(trip.budget, trip.homeCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Safety Funds:</span>
                    <span className="font-medium">{formatCurrency(trip.safetyFunds, trip.homeCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Currency:</span>
                    <span className="font-medium truncate">
                      {trip.homeCurrency} → {trip.tripCurrency}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className={cn("flex pt-3 border-t", "flex-wrap gap-2 justify-between", "sm:flex-nowrap")}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 w-full sm:w-auto bg-transparent"
                  onClick={() => router.push(`/dashboard/trips?id=${trip.id}`)}
                >
                  View Details
                </Button>
                {trip.status === "planned" && activeTab === "planned" && (
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleStartTrip(trip.id)}
                      disabled={hasOngoingTrip}
                      title={hasOngoingTrip ? "You already have an ongoing trip" : "Start Trip"}
                      className="flex-1 sm:flex-initial"
                    >
                      Start Trip
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(trip)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {trip.status === "ongoing" && activeTab === "ongoing" && (
                  <Button size="sm" onClick={() => handleCompleteTrip(trip.id)} className="w-full sm:w-auto">
                    Complete Trip
                  </Button>
                )}
                {(trip.status === "completed" || trip.status === "cancelled") && activeTab === "completed" && (
                  <Button variant="destructive" size="sm" onClick={() => confirmDelete(trip)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trip
              {tripToDelete ? ` "${tripToDelete.name}"` : ""} and all associated tasks and expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setTripToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrip} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
