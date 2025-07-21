"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthImageCarouselProps {
  className?: string
}

const images = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Login1.jpg-SI24sxDAHETDHwcxbn4IxyoRMoLJNb.jpeg",
    alt: "Ancient fortress city at sunset",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Login2.jpg-EPJG94M1AgqB16CyKNELQK54o1jmZX.jpeg",
    alt: "Vibrant city street with colorful signs",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Login3.jpg-XffmZhXNSYgDgA3G4Tlsp2roiiiIvk.jpeg",
    alt: "Collection of travel postcards and memories",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Login4.jpg-ODTQjHedEwrtnF44WcOt1DBy4n7O9n.jpeg",
    alt: "People releasing sky lanterns at night",
  },
]

export function AuthImageCarousel({ className }: AuthImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-advance the carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(goToNext, 4000)
    return () => clearInterval(interval)
  }, [goToNext])

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-2xl", className)}>
      {/* Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-1000",
            index === currentIndex ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={image.src || "/placeholder.svg"}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/40"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentIndex ? "bg-white w-4" : "bg-white/50",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
