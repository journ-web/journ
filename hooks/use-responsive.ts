"use client"

import { useEffect, useState } from "react"

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl"

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg")
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [windowWidth, setWindowWidth] = useState(0)

  // Add a check for SSR
  const isClient = typeof window !== "undefined"

  // Update the useEffect to handle SSR and be more reliable
  useEffect(() => {
    if (!isClient) return

    // Set initial window width
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)

      if (width < 640) {
        setBreakpoint("xs")
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width < 768) {
        setBreakpoint("sm")
        setIsMobile(true)
        setIsTablet(false)
        setIsDesktop(false)
      } else if (width < 1024) {
        setBreakpoint("md")
        setIsMobile(false)
        setIsTablet(true)
        setIsDesktop(false)
      } else if (width < 1280) {
        setBreakpoint("lg")
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      } else {
        setBreakpoint("xl")
        setIsMobile(false)
        setIsTablet(false)
        setIsDesktop(true)
      }
    }

    // Initial check
    handleResize()

    // Add event listener with debounce for performance
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 100)
    }

    window.addEventListener("resize", debouncedResize)
    window.addEventListener("orientationchange", handleResize)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", debouncedResize)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [isClient])

  // Set default values for SSR
  if (!isClient) {
    return {
      breakpoint: "lg",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      windowWidth: 1024,
    }
  }

  return {
    breakpoint,
    isMobile, // < 768px
    isTablet, // 768px - 1023px
    isDesktop, // >= 1024px
    windowWidth,
  }
}
