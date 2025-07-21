"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export function UserWelcome() {
  const { user, userDisplayName, refreshUserData } = useAuth()

  useEffect(() => {
    if (user) {
      refreshUserData()
    }
  }, [user, refreshUserData])

  if (!user) return null

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">Welcome, {userDisplayName || user.email?.split("@")[0] || "Traveler"}!</h1>
      <p className="text-muted-foreground">Manage your trips and travel plans all in one place.</p>
    </div>
  )
}
