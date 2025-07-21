"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useJournal } from "@/hooks/use-journal"
import { useTrips } from "@/hooks/use-trips"
import { EmojiPicker } from "./emoji-picker"
import { MapPin, Calendar, Tag, X, Save, AlertCircle } from "lucide-react"
import { format, isWithinInterval } from "date-fns"
import type { JournalEntry } from "@/types/journal"

interface MemoryModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTripId?: string | null
  initialDate?: Date
  entry?: JournalEntry | null
}

const weatherOptions = [
  { value: "sunny", label: "☀️ Sunny" },
  { value: "cloudy", label: "☁️ Cloudy" },
  { value: "rainy", label: "🌧️ Rainy" },
  { value: "snowy", label: "❄️ Snowy" },
  { value: "windy", label: "💨 Windy" },
  { value: "foggy", label: "🌫️ Foggy" },
]

export function MemoryModal({ isOpen, onClose, selectedTripId, initialDate, entry }: MemoryModalProps) {
  const { addEntry, updateEntry } = useJournal()
  const { trips } = useTrips()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tripId, setTripId] = useState<string | null>(selectedTripId || null)
  const [mood, setMood] = useState<JournalEntry["mood"]>("neutral")
  const [weather, setWeather] = useState("")
  const [location, setLocation] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Get selected trip details
  const selectedTrip = trips.find((trip) => trip.id === tripId)

  // Check if initial date is within trip range
  const isDateValid =
    selectedTrip && initialDate
      ? isWithinInterval(initialDate, {
          start: new Date(selectedTrip.startDate),
          end: new Date(selectedTrip.endDate),
        })
      : false

  // Initialize form with entry data if editing
  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setContent(entry.content)
      setTripId(entry.tripId || null)
      setMood(entry.mood)
      setWeather(entry.weather || "")
      setLocation(entry.location || "")
      setTags(entry.tags)
    } else {
      // Reset form for new entry
      setTitle("")
      setContent("")
      setTripId(selectedTripId || null)
      setMood("neutral")
      setWeather("")
      setLocation("")
      setTags([])
    }
  }, [entry, selectedTripId])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      })
      return
    }

    if (!tripId) {
      toast({
        title: "Trip Required",
        description: "Please select a trip for this memory.",
        variant: "destructive",
      })
      return
    }

    if (!entry && (!isDateValid || !initialDate)) {
      toast({
        title: "Invalid Date",
        description: "Please select a valid date within your trip range.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const memoryData = {
        title: title.trim(),
        content: content.trim(),
        tripId,
        mood,
        weather: weather || null,
        location: location.trim() || null,
        photos: [], // TODO: Add photo support
        tags,
      }

      if (entry) {
        await updateEntry(entry.id, memoryData)
        toast({
          title: "Memory Updated!",
          description: "Your memory has been updated successfully.",
        })
      } else {
        const entryId = await addEntry(memoryData, initialDate)
        toast({
          title: "Memory Created!",
          description: "Your memory has been saved successfully.",
        })
      }

      onClose()
    } catch (error) {
      console.error("Error saving memory:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border mx-4 sm:mx-auto">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {entry ? "Edit Memory" : "Create New Memory"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pt-4">
          {/* Trip Selection Warning */}
          {!tripId && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">Trip Required</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-500">
                    You must select a trip to create a memory. Memories are associated with specific trips.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Date Validation Warning */}
          {!entry && tripId && initialDate && !isDateValid && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Invalid Date</h4>
                  <p className="text-sm text-red-700 dark:text-red-500">
                    The selected date is outside your trip range. Please select a date within your trip.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your memory a title..."
              required
              className="bg-input text-foreground border border-input focus-visible:ring-ring"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-foreground">
              Your Story *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your experience..."
              rows={4}
              required
              className="bg-input text-foreground border border-input focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Trip Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Associated Trip *</Label>
            <Select value={tripId || "none"} onValueChange={(value) => setTripId(value === "none" ? null : value)}>
              <SelectTrigger className="bg-input text-foreground border border-input focus-visible:ring-ring">
                <SelectValue placeholder="Select a trip" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border border-border">
                <SelectItem value="none" className="hover:bg-accent hover:text-accent-foreground">
                  Select a trip...
                </SelectItem>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id} className="hover:bg-accent hover:text-accent-foreground">
                    <div className="flex items-center gap-2 w-full">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{trip.destination}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(trip.startDate), "MMM yyyy")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">How did you feel?</Label>
              <EmojiPicker selectedMood={mood} onMoodSelect={setMood} />
            </div>

            {/* Weather */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Weather</Label>
              <Select value={weather} onValueChange={setWeather}>
                <SelectTrigger className="bg-input text-foreground border border-input focus-visible:ring-ring">
                  <SelectValue placeholder="How was the weather?" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-border">
                  <SelectItem value="none" className="hover:bg-accent hover:text-accent-foreground">
                    No weather info
                  </SelectItem>
                  {weatherOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-foreground">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where were you?"
              className="bg-input text-foreground border border-input focus-visible:ring-ring"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1 bg-input text-foreground border border-input focus-visible:ring-ring"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" className="px-3 bg-transparent">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 flex items-center gap-1 text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Date info */}
          {initialDate && !entry && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent p-3 rounded-lg">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>This memory will be saved for {format(initialDate, "MMMM d, yyyy")}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="order-2 sm:order-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !tripId || (!entry && !isDateValid)}
              className="order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {entry ? "Update Memory" : "Save Memory"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
