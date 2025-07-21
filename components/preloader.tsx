"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function Preloader() {
  const [viewportHeight, setViewportHeight] = useState("100vh")
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle viewport height for mobile browsers (address the "100vh issue")
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(`${window.innerHeight}px`)
    }

    updateViewportHeight()
    window.addEventListener("resize", updateViewportHeight)

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
    }
  }, [])

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine if we should use dark mode
  const isDarkMode = mounted && (theme === "dark" || (theme === "system" && systemTheme === "dark"))

  // Choose the appropriate preloader based on theme
  const preloaderSrc = isDarkMode
    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Journve-Preloader-dark-4k-Ap2ZmFBTodOBMptxuk2rdLXir1POGP.mp4"
    : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Journve%20preloader-JFfdj1rp6rpmBzfjWPQidDwbssB819.gif"

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50"
      style={{ height: viewportHeight }}
    >
      <div className="relative w-full max-w-[min(80vw,80vh)] aspect-square px-4">
        <div className="w-full h-full flex items-center justify-center">
          {isDarkMode ? (
            <video autoPlay loop muted playsInline className="object-contain w-full h-full">
              <source src={preloaderSrc} type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Journve%20preloader-JFfdj1rp6rpmBzfjWPQidDwbssB819.gif"
                alt="Journve Loading"
                className="object-contain w-full h-full"
              />
            </video>
          ) : (
            <img
              src={preloaderSrc || "/placeholder.svg"}
              alt="Journve Loading"
              className="object-contain w-full h-full"
            />
          )}
        </div>
      </div>
      <p className="text-xl md:text-2xl lg:text-3xl font-medium text-muted-foreground animate-pulse mt-6">
        Preparing your journey...
      </p>
    </div>
  )
}
