"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

// First, make sure we're importing the CurrencySelector component
import { CurrencySelector } from "@/components/currency-selector"

interface Trip {
  id: string
  name: string
  homeCurrency: string
  tripCurrency: string
}

const TripPlanner = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newTrip, setNewTrip] = useState<Trip>({ id: "", name: "", homeCurrency: "", tripCurrency: "" })
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const { toast } = useToast()

  const handleAddTrip = () => {
    if (!newTrip.name || !newTrip.homeCurrency || !newTrip.tripCurrency) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    const newTripWithId: Trip = { ...newTrip, id: uuidv4() }
    setTrips([...trips, newTripWithId])
    setNewTrip({ id: "", name: "", homeCurrency: "", tripCurrency: "" })
    setOpen(false)
    toast({
      title: "Success",
      description: "Trip added successfully.",
    })
  }

  const handleEditTrip = () => {
    if (!newTrip.name || !newTrip.homeCurrency || !newTrip.tripCurrency) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    if (!selectedTrip) return

    const updatedTrips = trips.map((trip) => (trip.id === selectedTrip.id ? { ...newTrip, id: selectedTrip.id } : trip))
    setTrips(updatedTrips)
    setNewTrip({ id: "", name: "", homeCurrency: "", tripCurrency: "" })
    setEditOpen(false)
    setSelectedTrip(null)
    toast({
      title: "Success",
      description: "Trip updated successfully.",
    })
  }

  const handleDeleteTrip = (id: string) => {
    setTrips(trips.filter((trip) => trip.id !== id))
    toast({
      title: "Success",
      description: "Trip deleted successfully.",
    })
  }

  const handleOpenEditDialog = (trip: Trip) => {
    setSelectedTrip(trip)
    setNewTrip({ ...trip })
    setEditOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trip Planner</h1>
      <Button onClick={() => setOpen(true)}>Add Trip</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {trips.map((trip) => (
          <div key={trip.id} className="border rounded-md p-4">
            <h2 className="text-lg font-semibold">{trip.name}</h2>
            <p>Home Currency: {trip.homeCurrency}</p>
            <p>Trip Currency: {trip.tripCurrency}</p>
            <div className="flex justify-between mt-2">
              <Button size="sm" onClick={() => handleOpenEditDialog(trip)}>
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your trip and all of its data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteTrip(trip.id)}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <div></div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Trip</AlertDialogTitle>
            <AlertDialogDescription>Enter the details for your new trip.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                placeholder="Trip to Europe"
                value={newTrip.name}
                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
              />
            </div>
            {/* Replace the home currency Select with CurrencySelector */}
            <div className="grid gap-2">
              <Label htmlFor="home-currency">Home Currency</Label>
              <CurrencySelector
                value={newTrip.homeCurrency}
                onValueChange={(value) => setNewTrip({ ...newTrip, homeCurrency: value })}
              />
            </div>
            {/* Replace the trip currency Select with CurrencySelector */}
            <div className="grid gap-2">
              <Label htmlFor="trip-currency">Trip Currency</Label>
              <CurrencySelector
                value={newTrip.tripCurrency}
                onValueChange={(value) => setNewTrip({ ...newTrip, tripCurrency: value })}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddTrip}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogTrigger asChild>
          <div></div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Trip</AlertDialogTitle>
            <AlertDialogDescription>Edit the details for your trip.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Trip Name</Label>
              <Input
                id="edit-name"
                placeholder="Trip to Europe"
                value={newTrip.name}
                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
              />
            </div>
            {/* Also update the Edit Trip dialog with the same CurrencySelector components */}
            {/* For home currency: */}
            <div className="grid gap-2">
              <Label htmlFor="edit-home-currency">Home Currency</Label>
              <CurrencySelector
                value={newTrip.homeCurrency}
                onValueChange={(value) => setNewTrip({ ...newTrip, homeCurrency: value })}
              />
            </div>

            {/* For trip currency: */}
            <div className="grid gap-2">
              <Label htmlFor="edit-trip-currency">Trip Currency</Label>
              <CurrencySelector
                value={newTrip.tripCurrency}
                onValueChange={(value) => setNewTrip({ ...newTrip, tripCurrency: value })}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditTrip}>Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default TripPlanner
