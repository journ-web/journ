"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, BookOpen, CalendarIcon, MapPin, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { format, isSameDay, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, parseISO } from "date-fns"
import { useJournal } from "@/hooks/use-journal"
import { useTrips } from "@/hooks/use-trips"
import { MemoryModal } from "./memory-modal"
import { AllMemoriesModal } from "./all-memories-modal"
import { MemoryViewModal } from "./memory-view-modal"
import type { JournalEntry } from "@/types/journal"

interface CalendarViewProps {
  selectedTripId?: string | null
}

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  excited: "🤩",
  relaxed: "😌",
  adventurous: "🗺️",
  nostalgic: "🥺",
  grateful: "🙏",
  neutral: "😐",
}

export function CalendarView({ selectedTripId }: CalendarViewProps) {
  const { entries, loading, error } = useJournal()
  const { trips } = useTrips()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false)
  const [isAllMemoriesModalOpen, setIsAllMemoriesModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Get selected trip details
  const selectedTrip = useMemo(() => {
    if (!selectedTripId) return null
    return trips.find((trip) => trip.id === selectedTripId)
  }, [trips, selectedTripId])

  // Filter entries based on selected trip
  const filteredEntries = useMemo(() => {
    if (!selectedTripId) return entries
    const filtered = entries.filter((entry) => entry.tripId === selectedTripId)
    return filtered
  }, [entries, selectedTripId])

  // Get entries for selected date
  const selectedDateEntries = useMemo(() => {
    const selectedDateString = format(selectedDate, "yyyy-MM-dd")
    const dateEntries = filteredEntries.filter((entry) => {
      const entryDateString = entry.date
      return entryDateString === selectedDateString
    })
    return dateEntries
  }, [filteredEntries, selectedDate])

  // Get dates that have entries for calendar highlighting
  const datesWithEntries = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    const datesInMonth = filteredEntries
      .filter((entry) => {
        const entryDate = parseISO(entry.date)
        const isInMonth = isWithinInterval(entryDate, { start: monthStart, end: monthEnd })
        return isInMonth
      })
      .map((entry) => {
        const date = parseISO(entry.date)
        return date
      })
    return datesInMonth
  }, [filteredEntries, currentMonth])

  // Get disabled dates (dates outside trip range)
  const disabledDates = useMemo(() => {
    if (!selectedTrip) return (date: Date) => false

    const tripStart = new Date(selectedTrip.startDate)
    const tripEnd = new Date(selectedTrip.endDate)

    return (date: Date) => {
      return !isWithinInterval(date, { start: tripStart, end: tripEnd })
    }
  }, [selectedTrip])

  // Check if selected date is within trip range
  const isSelectedDateValid = useMemo(() => {
    if (!selectedTrip) return false
    const tripStart = new Date(selectedTrip.startDate)
    const tripEnd = new Date(selectedTrip.endDate)
    return isWithinInterval(selectedDate, { start: tripStart, end: tripEnd })
  }, [selectedTrip, selectedDate])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleCreateMemory = () => {
    if (!selectedTripId || !isSelectedDateValid) return
    setIsMemoryModalOpen(true)
  }

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsViewModalOpen(true)
  }

  const handleViewAllMemories = () => {
    setIsAllMemoriesModalOpen(true)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-48 sm:h-64 w-full" />
        <Skeleton className="h-64 sm:h-80 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-background border border-border">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground text-center">
            Oops! Something went wrong
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Journal Header */}
      <Card className="bg-background border border-border">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">Journal</h2>
              {selectedTrip ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{selectedTrip.destination}</span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm">
                    {format(new Date(selectedTrip.startDate), "MMM dd")} -{" "}
                    {format(new Date(selectedTrip.endDate), "MMM dd, yyyy")}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a trip to start journaling</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleViewAllMemories}
              disabled={!selectedTripId}
              className="text-sm sm:text-base bg-transparent"
            >
              <span className="hidden sm:inline">View All Memories</span>
              <span className="sm:hidden">Memories</span>
              <span className="ml-1 sm:ml-2">({filteredEntries.length})</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No Trip Selected Warning */}
      {!selectedTripId && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-medium text-amber-800 dark:text-amber-400 mb-1">
                  Select a Trip First
                </h3>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-500">
                  Please select a trip from the dropdown above to start adding memories to your journal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card className="bg-background border border-border">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevMonth}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-transparent"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-transparent"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop Calendar */}
            <div className="hidden md:block">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="h-8 lg:h-10 flex items-center justify-center text-xs lg:text-sm font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Generate calendar days */}
                {(() => {
                  const monthStart = startOfMonth(currentMonth)
                  const monthEnd = endOfMonth(currentMonth)
                  const startDate = new Date(monthStart)
                  startDate.setDate(startDate.getDate() - monthStart.getDay())

                  const days = []
                  const currentDate = new Date(startDate)

                  for (let i = 0; i < 42; i++) {
                    const date = new Date(currentDate)
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                    const isToday = isSameDay(date, new Date())
                    const isSelected = isSameDay(date, selectedDate)
                    const hasEntry = datesWithEntries.some((entryDate) => isSameDay(entryDate, date))
                    const isDisabled = disabledDates(date)

                    days.push(
                      <button
                        key={i}
                        onClick={() => !isDisabled && handleDateSelect(date)}
                        disabled={isDisabled}
                        className={`
                          h-8 lg:h-12 w-full rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 relative
                          ${
                            isSelected
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : isToday
                                ? "bg-accent text-accent-foreground border border-border"
                                : hasEntry
                                  ? "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/50"
                                  : isCurrentMonth
                                    ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                                    : "text-muted-foreground opacity-50"
                          }
                          ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                        `}
                      >
                        {date.getDate()}
                        {hasEntry && !isSelected && (
                          <div className="absolute bottom-0.5 lg:bottom-1 left-1/2 transform -translate-x-1/2 w-1 lg:w-1.5 h-1 lg:h-1.5 bg-pink-500 dark:bg-pink-600 rounded-full"></div>
                        )}
                      </button>,
                    )

                    currentDate.setDate(currentDate.getDate() + 1)
                  }

                  return days
                })()}
              </div>
            </div>

            {/* Mobile/Tablet Calendar */}
            <div className="md:hidden calendar-container">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={disabledDates}
                className="w-full"
                modifiers={{
                  hasEntry: datesWithEntries,
                }}
                modifiersStyles={{
                  hasEntry: {
                    backgroundColor: "rgb(var(--color-pink-50) / 0.8)",
                    color: "rgb(var(--color-pink-700))",
                    fontWeight: "600",
                  },
                }}
                classNames={{
                  months: "flex flex-col space-y-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center hidden",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center hidden",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-full font-normal text-xs sm:text-sm text-center py-2",
                  row: "flex w-full mt-2",
                  cell: "text-center text-xs sm:text-sm p-0 relative w-full",
                  day: "h-10 sm:h-12 w-full p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors flex items-center justify-center",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary",
                  day_today: "bg-accent text-accent-foreground font-semibold",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent border border-border rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800 rounded relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-500 dark:bg-pink-600 rounded-full"></div>
                </div>
                <span>Has memories</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date - Redesigned */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                    {format(selectedDate, "EEEE")}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedDateEntries.length > 0 && (
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs sm:text-sm">
                    {selectedDateEntries.length} {selectedDateEntries.length === 1 ? "memory" : "memories"}
                  </Badge>
                )}
                {selectedTrip && !isSelectedDateValid && (
                  <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800 text-xs sm:text-sm">
                    Outside trip dates
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={handleCreateMemory}
              disabled={!selectedTripId || !isSelectedDateValid}
              className="shadow-lg hover:shadow-xl transition-all duration-200 px-4 sm:px-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Memory</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {!selectedTripId ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Select a Trip First</h4>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                Choose a trip from the dropdown above to start creating memories for your journey.
              </p>
            </div>
          ) : !isSelectedDateValid ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-red-600 dark:text-red-500" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Date Outside Trip Range</h4>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-4">
                The selected date is outside your trip dates. Please select a date between{" "}
                <span className="font-medium">
                  {format(new Date(selectedTrip.startDate), "MMM d")} -{" "}
                  {format(new Date(selectedTrip.endDate), "MMM d, yyyy")}
                </span>
              </p>
            </div>
          ) : selectedDateEntries.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-500" />
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">No memories yet</h4>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
                This day is waiting for your story! Capture the moments, feelings, and experiences that make{" "}
                {format(selectedDate, "MMMM d")} special.
              </p>
              <Button
                onClick={handleCreateMemory}
                variant="outline"
                size="lg"
                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Create Your First Memory
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {selectedDateEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="bg-background/70 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 cursor-pointer hover:bg-background/90 hover:shadow-lg transition-all duration-200 group"
                  onClick={() => handleViewEntry(entry)}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">{moodEmojis[entry.mood] || moodEmojis.neutral}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-sm sm:text-base">
                          {entry.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm text-muted-foreground bg-accent px-2 py-1 rounded-full">
                            {format(parseISO(entry.date), "MMM d, yyyy")}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground capitalize">{entry.mood}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-foreground line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
                    {entry.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {entry.location && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs sm:text-sm"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{entry.location}</span>
                      </Badge>
                    )}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-muted-foreground bg-background/50 text-xs sm:text-sm"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {entry.tags.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground bg-background/50 text-xs sm:text-sm"
                          >
                            +{entry.tags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        selectedTripId={selectedTripId}
        initialDate={selectedDate}
      />

      <AllMemoriesModal
        isOpen={isAllMemoriesModalOpen}
        onClose={() => setIsAllMemoriesModalOpen(false)}
        entries={filteredEntries}
        onViewEntry={handleViewEntry}
      />

      {selectedEntry && (
        <MemoryViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedEntry(null)
          }}
          entry={selectedEntry}
        />
      )}
    </div>
  )
}
