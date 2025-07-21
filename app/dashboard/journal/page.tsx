"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { CalendarView } from "@/components/dashboard/journal/calendar-view"
import { TripSelector } from "@/components/dashboard/journal/trip-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground text-center">Please sign in to access your journal.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-background min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-bold text-foreground">Travel Journal</h1>
      <TripSelector selectedTripId={selectedTripId} onTripSelect={setSelectedTripId} />
      <CalendarView selectedTripId={selectedTripId} />
    </div>
  )
}
