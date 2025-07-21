export interface JournalEntry {
  id: string
  title: string
  content: string
  tripId?: string | null
  mood: "happy" | "sad" | "excited" | "relaxed" | "adventurous" | "nostalgic" | "grateful" | "neutral"
  weather?: string | null
  location?: string | null
  photos: string[]
  tags: string[]
  date: string // Store as YYYY-MM-DD format
  createdAt: string // ISO string
  updatedAt: string // ISO string
  userId?: string
}

export interface CreateJournalEntryData {
  title: string
  content: string
  tripId?: string | null
  mood: JournalEntry["mood"]
  weather?: string | null
  location?: string | null
  photos?: string[]
  tags?: string[]
  date: string // YYYY-MM-DD format
}

export interface UpdateJournalEntryData {
  title?: string
  content?: string
  tripId?: string | null
  mood?: JournalEntry["mood"]
  weather?: string | null
  location?: string | null
  photos?: string[]
  tags?: string[]
  date?: string // YYYY-MM-DD format
}

export interface JournalFormData {
  title: string
  content: string
  tripId?: string | null
  mood: JournalEntry["mood"]
  weather?: string
  location?: string
  photos: string[]
  tags: string[]
}
