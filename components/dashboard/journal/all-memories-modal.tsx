"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { useState, useMemo } from "react"
import type { JournalEntry } from "@/types/journal"

interface AllMemoriesModalProps {
  isOpen: boolean
  onClose: () => void
  entries: JournalEntry[]
  onViewEntry: (entry: JournalEntry) => void
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

export function AllMemoriesModal({ isOpen, onClose, entries, onViewEntry }: AllMemoriesModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date-desc")
  const [filterMood, setFilterMood] = useState("all")

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by mood
    if (filterMood !== "all") {
      filtered = filtered.filter((entry) => entry.mood === filterMood)
    }

    // Sort entries
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })
  }, [entries, searchTerm, sortBy, filterMood])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-background border border-border mx-4 sm:mx-auto">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            All Memories ({entries.length})
          </DialogTitle>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input text-foreground border border-input focus-visible:ring-ring"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-input text-foreground border border-input focus-visible:ring-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border border-border">
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            {/* Mood Filter */}
            <Select value={filterMood} onValueChange={setFilterMood}>
              <SelectTrigger className="w-full sm:w-48 bg-input text-foreground border border-input focus-visible:ring-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border border-border">
                <SelectItem value="all">All Moods</SelectItem>
                <SelectItem value="happy">😊 Happy</SelectItem>
                <SelectItem value="excited">🤩 Excited</SelectItem>
                <SelectItem value="relaxed">😌 Relaxed</SelectItem>
                <SelectItem value="adventurous">🗺️ Adventurous</SelectItem>
                <SelectItem value="grateful">🙏 Grateful</SelectItem>
                <SelectItem value="nostalgic">🥺 Nostalgic</SelectItem>
                <SelectItem value="neutral">😐 Neutral</SelectItem>
                <SelectItem value="sad">😢 Sad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedEntries.length} of {entries.length} memories
          </div>
        </div>

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 max-h-96">
          {filteredAndSortedEntries.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No memories found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {searchTerm || filterMood !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start creating memories to see them here"}
              </p>
            </div>
          ) : (
            filteredAndSortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-card text-card-foreground border border-border rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-accent hover:shadow-md transition-all duration-200 group"
                onClick={() => onViewEntry(entry)}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg sm:text-xl">{moodEmojis[entry.mood]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-sm sm:text-base">
                        {entry.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs sm:text-sm text-muted-foreground bg-accent px-2 py-1 rounded-full">
                          {format(new Date(entry.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground capitalize">{entry.mood}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-foreground line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
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
                          className="text-muted-foreground bg-background text-xs sm:text-sm"
                        >
                          #{tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 2 && (
                        <Badge variant="outline" className="text-muted-foreground bg-background text-xs sm:text-sm">
                          +{entry.tags.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
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
  )
}
