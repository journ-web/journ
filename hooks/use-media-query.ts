"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  // Default to false to avoid hydration mismatch
  const [matches, setMatches] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Safety check for SSR
    if (typeof window === "undefined") return undefined

    // Create the media query list
    const media = window.matchMedia(query)

    // Set the initial value
    setMatches(media.matches)

    // Define the callback function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add the listener with compatibility handling
    try {
      // Modern browsers
      media.addEventListener("change", listener)
    } catch (e) {
      // Fallback for older browsers
      try {
        // @ts-ignore - For older browsers
        media.addListener(listener)
      } catch (e2) {
        console.error("Media query listener not supported", e2)
      }
    }

    // Cleanup function with compatibility handling
    return () => {
      try {
        // Modern browsers
        media.removeEventListener("change", listener)
      } catch (e) {
        // Fallback for older browsers
        try {
          // @ts-ignore - For older browsers
          media.removeListener(listener)
        } catch (e2) {
          console.error("Media query listener removal not supported", e2)
        }
      }
    }
  }, [query])

  // Return false during SSR to avoid hydration mismatch
  return mounted ? matches : false
}
