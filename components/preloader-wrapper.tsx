"use client"

import { useAuth } from "@/contexts/auth-context"
import { Preloader } from "./preloader"
import { useEffect, useState } from "react"

export function PreloaderWrapper() {
  const { showPreloader } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only render on client-side to avoid hydration mismatch
  if (!isClient) return null
  if (!showPreloader) return null

  return <Preloader />
}
