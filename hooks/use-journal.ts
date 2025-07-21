"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  subscribeToJournalEntries,
} from "@/lib/firestore-service"
import type { JournalEntry, CreateJournalEntryData, UpdateJournalEntryData } from "@/types/journal"
import { format } from "date-fns" // Import format

export function useJournal(tripId?: string) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch entries on mount and when tripId changes
  useEffect(() => {
    if (!user?.uid) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    console.log("=== JOURNAL HOOK: Setting up subscription ===")
    console.log("User ID:", user.uid)
    console.log("Trip ID filter:", tripId)

    // Set up real-time subscription - Don't filter by tripId here, get all entries
    const unsubscribe = subscribeToJournalEntries(
      user.uid,
      (fetchedEntries) => {
        console.log("=== JOURNAL HOOK: Entries received ===")
        console.log("Total entries fetched:", fetchedEntries.length)
        fetchedEntries.forEach((entry, index) => {
          console.log(`Entry ${index + 1}:`, {
            id: entry.id,
            title: entry.title,
            date: entry.date,
            tripId: entry.tripId,
          })
        })
        setEntries(fetchedEntries)
        setLoading(false)
      },
      undefined, // Don't filter by tripId in the subscription
    )

    return () => {
      console.log("=== JOURNAL HOOK: Cleaning up subscription ===")
      unsubscribe()
    }
  }, [user?.uid]) // Remove tripId from dependencies

  const addEntry = useCallback(
    async (entryData: Omit<CreateJournalEntryData, "date">, selectedDate?: Date) => {
      if (!user?.uid) {
        console.error("User not authenticated")
        throw new Error("User not authenticated")
      }

      console.log("=== JOURNAL HOOK: Adding entry ===")
      console.log("Raw entry data:", entryData)
      console.log("Selected date:", selectedDate)
      console.log("User ID:", user.uid)

      // Use the selected date or current date as fallback
      const entryDate = selectedDate || new Date()
      // Use date-fns format to ensure local date is preserved
      const formattedDate = format(entryDate, "yyyy-MM-dd") // FIX: Use local date format

      const createData: CreateJournalEntryData = {
        title: entryData.title || "",
        content: entryData.content || "",
        tripId: entryData.tripId || null,
        mood: entryData.mood || "neutral",
        weather: entryData.weather || null,
        location: entryData.location || null,
        photos: entryData.photos || [],
        tags: entryData.tags || [],
        date: formattedDate,
      }

      console.log("Formatted create data:", createData)

      try {
        const result = await createJournalEntry(user.uid, createData)

        console.log("=== JOURNAL HOOK: Create result ===")
        console.log("Success:", result.success)
        console.log("Entry ID:", result.id)
        console.log("Error:", result.error)

        if (!result.success) {
          console.error("Failed to create journal entry:", result.error)
          throw new Error(typeof result.error === "string" ? result.error : "Failed to save memory")
        }

        console.log("Journal entry created successfully with ID:", result.id)
        return result.id
      } catch (error) {
        console.error("=== JOURNAL HOOK: Error in addEntry ===")
        console.error("Error details:", error)
        throw error
      }
    },
    [user?.uid],
  )

  const updateEntry = useCallback(
    async (entryId: string, entryData: UpdateJournalEntryData) => {
      if (!user?.uid) {
        throw new Error("User not authenticated")
      }

      console.log("=== JOURNAL HOOK: Updating entry ===")
      console.log("Entry ID:", entryId)
      console.log("Update data:", entryData)

      const result = await updateJournalEntry(user.uid, entryId, entryData)

      if (!result.success) {
        throw new Error(result.error as string)
      }
    },
    [user?.uid],
  )

  const deleteEntry = useCallback(
    async (entryId: string) => {
      if (!user?.uid) {
        throw new Error("User not authenticated")
      }

      console.log("=== JOURNAL HOOK: Deleting entry ===")
      console.log("Entry ID:", entryId)

      const result = await deleteJournalEntry(user.uid, entryId)

      if (!result.success) {
        throw new Error(result.error as string)
      }
    },
    [user?.uid],
  )

  const getEntriesByDate = useCallback(
    (date: Date) => {
      const dateString = format(date, "yyyy-MM-dd") // Use local date format for comparison
      const dateEntries = entries.filter((entry) => {
        const entryDate = entry.date
        return entryDate === dateString
      })
      console.log("=== JOURNAL HOOK: Getting entries by date ===")
      console.log("Date:", dateString)
      console.log("Found entries:", dateEntries.length)
      return dateEntries
    },
    [entries],
  )

  const getEntriesByTrip = useCallback(
    (tripId: string) => {
      const tripEntries = entries.filter((entry) => entry.tripId === tripId)
      console.log("=== JOURNAL HOOK: Getting entries by trip ===")
      console.log("Trip ID:", tripId)
      console.log("Found entries:", tripEntries.length)
      return tripEntries
    },
    [entries],
  )

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesByDate,
    getEntriesByTrip,
  }
}
