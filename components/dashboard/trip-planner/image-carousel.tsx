"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  className?: string
}

export function ImageCarousel({ className }: ImageCarouselProps) {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Static travel image */}
      <div className="absolute inset-0">
        <Image
          src="/images/travel-hero-static.webp"
          alt="Travel planning illustration with luggage, maps, compass, and travel elements"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10"></div>
    </div>
  )
}
