"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Cloud, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useJournal } from "@/hooks/use-journal"
import { MemoryModal } from "./memory-modal"
import type { JournalEntry } from "@/types/journal"

interface MemoryViewModalProps {
  isOpen: boolean
  onClose: () => void
  entry: JournalEntry
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

const weatherLabels = {
  sunny: "☀️ Sunny",
  cloudy: "☁️ Cloudy",
  rainy: "🌧️ Rainy",
  snowy: "❄️ Snowy",
  windy: "💨 Windy",
  foggy: "🌫️ Foggy",
}

export function MemoryViewModal({ isOpen, onClose, entry }: MemoryViewModalProps) {
  const { deleteEntry } = useJournal()
  const { toast } = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEntry(entry.id)
      toast({
        title: "Memory Deleted",
        description: "Your memory has been deleted successfully.",
      })
      onClose()
    } catch (error) {
      console.error("Error deleting memory:", error)
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border mx-4 sm:mx-auto">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">{moodEmojis[entry.mood] || moodEmojis.neutral}</span>
                <span className="truncate">{entry.title}</span>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-lg">{moodEmojis[entry.mood] || moodEmojis.neutral}</span>
                <span className="capitalize">{entry.mood}</span>
              </div>
            </div>

            {/* Location and Weather */}
            {(entry.location || entry.weather) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entry.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{entry.location}</span>
                  </div>
                )}
                {entry.weather && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Cloud className="h-4 w-4 flex-shrink-0" />
                    <span>{weatherLabels[entry.weather as keyof typeof weatherLabels] || entry.weather}</span>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-foreground">Your Story</h3>
              <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
                <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            </div>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-medium text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="bg-secondary text-secondary-foreground text-sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Photos placeholder */}
            {entry.photos && entry.photos.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-medium text-foreground">Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {entry.photos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Photo {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <MemoryModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        entry={entry}
        selectedTripId={entry.tripId}
      />
    </>
  )
}
