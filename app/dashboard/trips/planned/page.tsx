"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useTrips } from "@/hooks/use-trips"
import { TripList } from "@/components/dashboard/trip-planner/trip-list"
import { Plus, MapPin, Search, X, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, addDays } from "date-fns"
import { CreditCard, Shield } from "lucide-react"
import { getExchangeRate } from "@/utils/currency"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Trip, TripType } from "@/types/trip"
// Add import for CurrencySelector at the top of the file
import { SimpleCurrencySelector } from "@/components/simple-currency-selector"

export default function PlannedTripsPage() {
  const { trips, loading, addTrip } = useTrips()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddTripOpen, setIsAddTripOpen] = useState(false)
  const [showLimitAlert, setShowLimitAlert] = useState(false)

  // New trip form state
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    tripType: "solo" as TripType,
    people: 1,
    budget: 0,
    safetyFunds: 0,
    homeCurrency: "USD",
    tripCurrency: "USD",
  })

  // Add validation state after the newTrip state
  const [tripFormErrors, setTripFormErrors] = useState<Record<string, string>>({})

  const plannedTrips = trips
    .filter((trip) => trip.status === "planned")
    .filter((trip) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return trip.name.toLowerCase().includes(query) || trip.destination.toLowerCase().includes(query)
    })

  const ongoingTrips = trips.filter((trip) => trip.status === "ongoing")
  const hasOngoingTrip = ongoingTrips.length > 0
  const hasReachedPlannedLimit = plannedTrips.length >= 3

  // Check if we've reached the planned trips limit
  useEffect(() => {
    setShowLimitAlert(hasReachedPlannedLimit)
  }, [hasReachedPlannedLimit])

  // Update the handleAddTrip function to include validation
  const handleAddTrip = async () => {
    // Check if we've reached the limit of planned trips
    if (plannedTrips.length >= 3) {
      setShowLimitAlert(true)
      return
    }

    // Validate form fields
    const errors: Record<string, string> = {}

    if (!newTrip.name.trim()) errors.name = "Trip name is required"
    if (!newTrip.destination.trim()) errors.destination = "Destination is required"
    if (!newTrip.startDate) errors.startDate = "Start date is required"
    if (!newTrip.endDate) errors.endDate = "End date is required"
    if (new Date(newTrip.endDate) < new Date(newTrip.startDate)) {
      errors.endDate = "End date must be after start date"
    }
    if (!newTrip.tripType) errors.tripType = "Trip type is required"
    if (newTrip.people <= 0) errors.people = "Number of people must be at least 1"
    if (!newTrip.homeCurrency) errors.homeCurrency = "Home currency is required"
    if (!newTrip.tripCurrency) errors.tripCurrency = "Trip currency is required"
    if (newTrip.budget < 0) errors.budget = "Budget cannot be negative"
    if (newTrip.safetyFunds < 0) errors.safetyFunds = "Safety funds cannot be negative"

    setTripFormErrors(errors)

    // If there are errors, don't proceed
    if (Object.keys(errors).length > 0) return

    const exchangeRate = getExchangeRate(newTrip.homeCurrency, newTrip.tripCurrency)

    const tripData: Omit<Trip, "id" | "tasks" | "expenses"> = {
      name: newTrip.name,
      destination: newTrip.destination,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      tripType: newTrip.tripType,
      people: newTrip.people,
      budget: newTrip.budget,
      miscellaneousFunds: 0,
      safetyFunds: newTrip.safetyFunds,
      status: "planned",
      homeCurrency: newTrip.homeCurrency,
      tripCurrency: newTrip.tripCurrency,
      exchangeRate,
    }

    const result = await addTrip(tripData)
    if (result) {
      resetTripForm()
      setIsAddTripOpen(false)
    }
  }

  // Update the resetTripForm function to also reset errors
  const resetTripForm = () => {
    setNewTrip({
      name: "",
      destination: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      tripType: "solo",
      people: 1,
      budget: 0,
      safetyFunds: 0,
      homeCurrency: "USD",
      tripCurrency: "USD",
    })
    setTripFormErrors({})
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planned Trips</h1>
          <p className="text-muted-foreground">Plan and prepare for your upcoming adventures</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
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
          <Dialog open={isAddTripOpen} onOpenChange={setIsAddTripOpen}>
            <DialogTrigger asChild>
              <Button disabled={hasReachedPlannedLimit} className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Add Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="text-xl">Add New Trip</DialogTitle>
                <DialogDescription>Enter the details of your upcoming trip</DialogDescription>
              </DialogHeader>

              {showLimitAlert && (
                <Alert variant="destructive" className="mx-6 mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Trip Limit Reached</AlertTitle>
                  <AlertDescription>
                    You've reached the limit of 3 planned trips. Complete or delete a trip to add a new one.
                  </AlertDescription>
                </Alert>
              )}

              <div className="px-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                <div className="space-y-6 py-4">
                  {/* Trip Details Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Trip Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trip-name">Trip Name</Label>
                        <Input
                          id="trip-name"
                          value={newTrip.name}
                          onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                          placeholder="Summer Vacation"
                          className={tripFormErrors.name ? "border-red-500" : ""}
                        />
                        {tripFormErrors.name && <p className="text-xs text-red-500">{tripFormErrors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destination">Destination</Label>
                        <Input
                          id="destination"
                          value={newTrip.destination}
                          onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                          placeholder="Paris, France"
                          className={tripFormErrors.destination ? "border-red-500" : ""}
                        />
                        {tripFormErrors.destination && (
                          <p className="text-xs text-red-500">{tripFormErrors.destination}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Trip Dates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={newTrip.startDate}
                          onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                          className={tripFormErrors.startDate ? "border-red-500" : ""}
                        />
                        {tripFormErrors.startDate && <p className="text-xs text-red-500">{tripFormErrors.startDate}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={newTrip.endDate}
                          onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                          className={tripFormErrors.endDate ? "border-red-500" : ""}
                        />
                        {tripFormErrors.endDate && <p className="text-xs text-red-500">{tripFormErrors.endDate}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Travelers Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Travelers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trip-type">Trip Type</Label>
                        <Select
                          value={newTrip.tripType}
                          onValueChange={(value) => setNewTrip({ ...newTrip, tripType: value as TripType })}
                        >
                          <SelectTrigger id="trip-type" className={tripFormErrors.tripType ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solo">Solo</SelectItem>
                            <SelectItem value="couple">Couple</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="friends">Friends</SelectItem>
                          </SelectContent>
                        </Select>
                        {tripFormErrors.tripType && <p className="text-xs text-red-500">{tripFormErrors.tripType}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="people">Number of People</Label>
                        <Input
                          id="people"
                          type="number"
                          min={1}
                          value={newTrip.people}
                          onChange={(e) => setNewTrip({ ...newTrip, people: Number.parseInt(e.target.value) || 1 })}
                          className={tripFormErrors.people ? "border-red-500" : ""}
                        />
                        {tripFormErrors.people && <p className="text-xs text-red-500">{tripFormErrors.people}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Currency Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Currency Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="home-currency">Home Currency</Label>
                        <SimpleCurrencySelector
                          value={newTrip.homeCurrency}
                          onValueChange={(value) => setNewTrip({ ...newTrip, homeCurrency: value })}
                          placeholder="Select home currency"
                          className={tripFormErrors.homeCurrency ? "border-red-500" : ""}
                        />
                        {tripFormErrors.homeCurrency && (
                          <p className="text-xs text-red-500">{tripFormErrors.homeCurrency}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trip-currency">Trip Currency</Label>
                        <SimpleCurrencySelector
                          value={newTrip.tripCurrency}
                          onValueChange={(value) => setNewTrip({ ...newTrip, tripCurrency: value })}
                          placeholder="Select trip currency"
                          className={tripFormErrors.tripCurrency ? "border-red-500" : ""}
                        />
                        {tripFormErrors.tripCurrency && (
                          <p className="text-xs text-red-500">{tripFormErrors.tripCurrency}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Budget Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">Budget Planning</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget">Trip Budget</Label>
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="budget"
                            type="number"
                            min={0}
                            step={0.01}
                            value={newTrip.budget}
                            onChange={(e) => setNewTrip({ ...newTrip, budget: Number.parseFloat(e.target.value) || 0 })}
                            className={tripFormErrors.budget ? "border-red-500" : ""}
                          />
                        </div>
                        {tripFormErrors.budget && <p className="text-xs text-red-500">{tripFormErrors.budget}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="safety-funds">Safety Funds</Label>
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="safety-funds"
                            type="number"
                            min={0}
                            step={0.01}
                            value={newTrip.safetyFunds}
                            onChange={(e) =>
                              setNewTrip({ ...newTrip, safetyFunds: Number.parseFloat(e.target.value) || 0 })
                            }
                            className={tripFormErrors.safetyFunds ? "border-red-500" : ""}
                          />
                        </div>
                        {tripFormErrors.safetyFunds && (
                          <p className="text-xs text-red-500">{tripFormErrors.safetyFunds}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t">
                <Button variant="outline" onClick={() => setIsAddTripOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTrip} disabled={hasReachedPlannedLimit}>
                  Save Trip
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showLimitAlert && (
        <Alert variant="warning" className="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Trip Limit Reached</AlertTitle>
          <AlertDescription>
            You've reached the limit of 3 planned trips. Complete or delete a trip to add a new one.
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-[300px] animate-pulse">
              <CardHeader className="bg-muted/50 h-40" />
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
      ) : plannedTrips.length > 0 ? (
        <TripList trips={plannedTrips} activeTab="planned" hasOngoingTrip={hasOngoingTrip} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">No planned trips yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start planning your next adventure by creating a new trip.
          </p>
          <Button onClick={() => setIsAddTripOpen(true)} disabled={hasReachedPlannedLimit}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trip
          </Button>
        </div>
      )}
    </div>
  )
}
