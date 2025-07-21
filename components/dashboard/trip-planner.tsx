"use client"

import { useState } from "react"
import { format, addDays } from "date-fns"
import { CalendarIcon, Plus, X, MapPin, Clock, DollarSign, Users, Briefcase, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Types
interface Task {
  id: string
  name: string
  notes?: string
  location?: string
  time: string
  budgetCost?: number
  completed: boolean
}

interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  tripType: string
  people: number
  budget: number
  wallet: number
  safetyFunds: number
  status: "planned" | "ongoing" | "completed" | "cancelled"
  tasks: Record<string, Task[]> // key is date string, value is array of tasks
}

// Mock data
const mockTrips: Trip[] = [
  {
    id: "trip-1",
    name: "Summer Vacation",
    destination: "Bali, Indonesia",
    startDate: "2023-07-15",
    endDate: "2023-07-25",
    tripType: "family",
    people: 4,
    budget: 3000,
    wallet: 500,
    safetyFunds: 1000,
    status: "planned",
    tasks: {
      "2023-07-15": [
        {
          id: "task-1",
          name: "Check-in at Hotel Paradiso",
          location: "Kuta Beach",
          time: "14:00",
          budgetCost: 0,
          completed: false,
        },
        {
          id: "task-2",
          name: "Dinner at Seafood Restaurant",
          location: "Jimbaran Bay",
          time: "19:00",
          budgetCost: 120,
          completed: false,
        },
      ],
      "2023-07-16": [
        {
          id: "task-3",
          name: "Ubud Monkey Forest Tour",
          location: "Ubud",
          time: "10:00",
          budgetCost: 80,
          completed: false,
        },
      ],
    },
  },
  {
    id: "trip-2",
    name: "Business Conference",
    destination: "New York, USA",
    startDate: "2023-09-10",
    endDate: "2023-09-15",
    tripType: "business",
    people: 1,
    budget: 2500,
    wallet: 300,
    safetyFunds: 500,
    status: "planned",
    tasks: {},
  },
  {
    id: "trip-3",
    name: "Weekend Getaway",
    destination: "Paris, France",
    startDate: "2023-06-01",
    endDate: "2023-06-04",
    tripType: "couple",
    people: 2,
    budget: 1500,
    wallet: 200,
    safetyFunds: 300,
    status: "completed",
    tasks: {},
  },
  {
    id: "trip-4",
    name: "Backpacking Trip",
    destination: "Thailand",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 10), "yyyy-MM-dd"),
    tripType: "solo",
    people: 1,
    budget: 1000,
    wallet: 200,
    safetyFunds: 300,
    status: "ongoing",
    tasks: {},
  },
]

export function TripPlanner() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddTripOpen, setIsAddTripOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // New trip form state
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    tripType: "solo",
    people: 1,
    budget: 0,
    wallet: 0,
    safetyFunds: 0,
  })

  // New task form state
  const [newTask, setNewTask] = useState({
    name: "",
    notes: "",
    location: "",
    time: "",
    budgetCost: 0,
  })

  const handleAddTrip = () => {
    const trip: Trip = {
      id: `trip-${trips.length + 1}`,
      name: newTrip.name,
      destination: newTrip.destination,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      tripType: newTrip.tripType,
      people: newTrip.people,
      budget: newTrip.budget,
      wallet: newTrip.wallet,
      safetyFunds: newTrip.safetyFunds,
      status: "planned",
      tasks: {},
    }

    setTrips([...trips, trip])
    setNewTrip({
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      tripType: "solo",
      people: 1,
      budget: 0,
      wallet: 0,
      safetyFunds: 0,
    })
    setIsAddTripOpen(false)
  }

  const handleStartTrip = (tripId: string) => {
    setTrips(trips.map((trip) => (trip.id === tripId ? { ...trip, status: "ongoing" } : trip)))
  }

  const handleCancelTrip = (tripId: string) => {
    setTrips(trips.map((trip) => (trip.id === tripId ? { ...trip, status: "cancelled" } : trip)))
  }

  const handleCompleteTrip = (tripId: string) => {
    setTrips(trips.map((trip) => (trip.id === tripId ? { ...trip, status: "completed" } : trip)))
  }

  const handleAddTask = () => {
    if (!selectedTrip || !selectedDate) return

    const task: Task = {
      id: `task-${Date.now()}`,
      name: newTask.name,
      notes: newTask.notes,
      location: newTask.location,
      time: newTask.time,
      budgetCost: newTask.budgetCost,
      completed: false,
    }

    const updatedTrip = { ...selectedTrip }
    if (!updatedTrip.tasks[selectedDate]) {
      updatedTrip.tasks[selectedDate] = []
    }
    updatedTrip.tasks[selectedDate].push(task)

    setTrips(trips.map((trip) => (trip.id === selectedTrip.id ? updatedTrip : trip)))
    setSelectedTrip(updatedTrip)
    setNewTask({
      name: "",
      notes: "",
      location: "",
      time: "",
      budgetCost: 0,
    })
    setIsAddTaskOpen(false)
  }

  const handleToggleTaskCompletion = (date: string, taskId: string) => {
    if (!selectedTrip) return

    const updatedTrip = { ...selectedTrip }
    const taskIndex = updatedTrip.tasks[date].findIndex((task) => task.id === taskId)

    if (taskIndex !== -1) {
      updatedTrip.tasks[date][taskIndex].completed = !updatedTrip.tasks[date][taskIndex].completed
      setTrips(trips.map((trip) => (trip.id === selectedTrip.id ? updatedTrip : trip)))
      setSelectedTrip(updatedTrip)
    }
  }

  const handleDeleteTask = (date: string, taskId: string) => {
    if (!selectedTrip) return

    const updatedTrip = { ...selectedTrip }
    updatedTrip.tasks[date] = updatedTrip.tasks[date].filter((task) => task.id !== taskId)

    setTrips(trips.map((trip) => (trip.id === selectedTrip.id ? updatedTrip : trip)))
    setSelectedTrip(updatedTrip)
  }

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === "all") return true
    if (activeTab === "planned") return trip.status === "planned"
    if (activeTab === "ongoing") return trip.status === "ongoing"
    if (activeTab === "completed") return trip.status === "completed"
    return false
  })

  const getTripDates = (trip: Trip) => {
    const dates: string[] = []
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)

    const current = new Date(start)
    while (current <= end) {
      dates.push(format(current, "yyyy-MM-dd"))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const getTasksForDate = (date: string) => {
    if (!selectedTrip) return []
    return selectedTrip.tasks[date] || []
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
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getTripProgress = (trip: Trip) => {
    if (trip.status === "planned") return 0
    if (trip.status === "completed") return 100

    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const today = new Date()

    if (today < start) return 0
    if (today > end) return 100

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const daysElapsed = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    return Math.round((daysElapsed / totalDays) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trip Planner</h1>
          <p className="text-muted-foreground">Plan and manage your trips with ease</p>
        </div>
        <Dialog open={isAddTripOpen} onOpenChange={setIsAddTripOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Trip</DialogTitle>
              <DialogDescription>Enter the details of your upcoming trip</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="trip-name">Trip Name</Label>
                  <Input
                    id="trip-name"
                    value={newTrip.name}
                    onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                    placeholder="Summer Vacation"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={newTrip.destination}
                    onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                    placeholder="Paris, France"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="trip-type">Trip Type</Label>
                  <Select
                    value={newTrip.tripType}
                    onValueChange={(value) => setNewTrip({ ...newTrip, tripType: value })}
                  >
                    <SelectTrigger id="trip-type">
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="people">Number of People</Label>
                  <Input
                    id="people"
                    type="number"
                    min={1}
                    value={newTrip.people}
                    onChange={(e) => setNewTrip({ ...newTrip, people: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    min={0}
                    value={newTrip.budget}
                    onChange={(e) => setNewTrip({ ...newTrip, budget: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wallet">Wallet</Label>
                  <Input
                    id="wallet"
                    type="number"
                    min={0}
                    value={newTrip.wallet}
                    onChange={(e) => setNewTrip({ ...newTrip, wallet: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="safety-funds">Safety Funds</Label>
                  <Input
                    id="safety-funds"
                    type="number"
                    min={0}
                    value={newTrip.safetyFunds}
                    onChange={(e) => setNewTrip({ ...newTrip, safetyFunds: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTripOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTrip}>Save Trip</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Trips</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium">No trips found</h3>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "all"
                    ? "You haven't created any trips yet."
                    : activeTab === "planned"
                      ? "You don't have any planned trips."
                      : activeTab === "ongoing"
                        ? "You don't have any ongoing trips."
                        : "You don't have any completed trips."}
                </p>
                <Button className="mt-4" onClick={() => setIsAddTripOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trip
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <Card key={trip.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{trip.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {trip.destination}
                        </CardDescription>
                      </div>
                      <Badge className={`${getTripStatusColor(trip.status)} text-white capitalize`}>
                        {trip.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {getTripTypeIcon(trip.tripType)}
                          <span className="text-sm ml-2">
                            {trip.people} {trip.people === 1 ? "Person" : "People"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget:</span>
                        <span className="font-medium">${trip.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Wallet:</span>
                        <span className="font-medium">${trip.wallet.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Safety Funds:</span>
                        <span className="font-medium">${trip.safetyFunds.toLocaleString()}</span>
                      </div>
                    </div>
                    {trip.status === "ongoing" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Trip Progress:</span>
                          <span>{getTripProgress(trip)}%</span>
                        </div>
                        <Progress value={getTripProgress(trip)} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTrip(trip)
                        setSelectedDate(format(new Date(trip.startDate), "yyyy-MM-dd"))
                      }}
                    >
                      View Details
                    </Button>
                    {trip.status === "planned" && (
                      <Button size="sm" onClick={() => handleStartTrip(trip.id)}>
                        Start Trip
                      </Button>
                    )}
                    {trip.status === "ongoing" && (
                      <Button size="sm" onClick={() => handleCompleteTrip(trip.id)}>
                        Complete Trip
                      </Button>
                    )}
                    {trip.status === "planned" && (
                      <Button variant="destructive" size="sm" onClick={() => handleCancelTrip(trip.id)}>
                        Cancel
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedTrip && (
        <Dialog open={!!selectedTrip} onOpenChange={(open) => !open && setSelectedTrip(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-2xl">{selectedTrip.name}</DialogTitle>
                  <DialogDescription className="flex items-center mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {selectedTrip.destination}
                  </DialogDescription>
                </div>
                <Badge className={`${getTripStatusColor(selectedTrip.status)} text-white capitalize`}>
                  {selectedTrip.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
              <div className="w-full md:w-1/3 space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium mb-2">Trip Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dates:</span>
                      <span>
                        {format(new Date(selectedTrip.startDate), "MMM d")} -{" "}
                        {format(new Date(selectedTrip.endDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>
                        {Math.ceil(
                          (new Date(selectedTrip.endDate).getTime() - new Date(selectedTrip.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trip Type:</span>
                      <span className="capitalize">{selectedTrip.tripType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">People:</span>
                      <span>{selectedTrip.people}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium mb-2">Budget Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span>${selectedTrip.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet:</span>
                      <span>${selectedTrip.wallet.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Safety Funds:</span>
                      <span>${selectedTrip.safetyFunds.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">
                        ${(selectedTrip.budget + selectedTrip.wallet + selectedTrip.safetyFunds).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium mb-2">Calendar</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate ? new Date(selectedDate) : undefined}
                    onSelect={(date) => date && setSelectedDate(format(date, "yyyy-MM-dd"))}
                    disabled={(date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      const tripDates = getTripDates(selectedTrip)
                      return !tripDates.includes(dateStr)
                    }}
                    className="rounded-md border"
                  />
                </div>
              </div>

              <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    Tasks for {selectedDate ? format(new Date(selectedDate), "MMMM d, yyyy") : "Selected Date"}
                  </h3>
                  {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                    <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Add New Task</DialogTitle>
                          <DialogDescription>
                            Add a task for{" "}
                            {selectedDate ? format(new Date(selectedDate), "MMMM d, yyyy") : "selected date"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="task-name">Task Name</Label>
                            <Input
                              id="task-name"
                              value={newTask.name}
                              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                              placeholder="Visit Eiffel Tower"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="task-location">Location</Label>
                              <Input
                                id="task-location"
                                value={newTask.location}
                                onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                                placeholder="Champ de Mars, Paris"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="task-time">Time</Label>
                              <Input
                                id="task-time"
                                type="time"
                                value={newTask.time}
                                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="task-budget">Budget Cost</Label>
                            <Input
                              id="task-budget"
                              type="number"
                              min={0}
                              value={newTask.budgetCost}
                              onChange={(e) =>
                                setNewTask({ ...newTask, budgetCost: Number.parseFloat(e.target.value) || 0 })
                              }
                              placeholder="0"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="task-notes">Notes</Label>
                            <Textarea
                              id="task-notes"
                              value={newTask.notes}
                              onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                              placeholder="Additional details about the task"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddTask}>Add Task</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <ScrollArea className="flex-1 pr-4">
                  {selectedDate ? (
                    getTasksForDate(selectedDate).length > 0 ? (
                      <div className="space-y-4">
                        {getTasksForDate(selectedDate)
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((task) => (
                            <Card key={task.id} className={task.completed ? "opacity-70" : ""}>
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg flex items-center">
                                    {task.completed && <Check className="h-4 w-4 mr-2 text-green-500" />}
                                    {task.name}
                                  </CardTitle>
                                  {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleToggleTaskCompletion(selectedDate, task.id)}
                                      >
                                        {task.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleDeleteTask(selectedDate, task.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {task.location && (
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span>{task.location}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>
                                      {task.time
                                        ? new Date(`2000-01-01T${task.time}`).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "No time set"}
                                    </span>
                                  </div>
                                  {task.budgetCost > 0 && (
                                    <div className="flex items-center">
                                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                      <span>${task.budgetCost.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                                {task.notes && (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    <p>{task.notes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground">No tasks for this day</p>
                        {selectedTrip.status !== "completed" && selectedTrip.status !== "cancelled" && (
                          <Button variant="outline" className="mt-4" onClick={() => setIsAddTaskOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">Select a date to view tasks</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
