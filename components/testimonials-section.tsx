"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Josh Birmingham",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "I love Tripwiser! The trip planning tools are so easy to use, and I saved money on my last vacation. Highly recommended for anyone who loves to travel.",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "The destination recommendations were spot on! I discovered places I never would have found on my own. The interface is intuitive and made planning my trip a breeze.",
    },
    {
      id: 3,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 4,
      text: "Great service overall. The expense splitting feature saved our group a lot of awkward conversations about money during our trip. Will definitely use again!",
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-white/80 dark:bg-gray-800/80 px-3 py-1 text-sm shadow-sm backdrop-blur-sm mb-4">
            <span className="text-pink-500 font-medium">TESTIMONIALS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Trust our clients</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 relative">
            <div className="flex flex-col items-center text-center">
              <Image
                src={testimonials[activeIndex].avatar || "/placeholder.svg"}
                alt={testimonials[activeIndex].name}
                width={60}
                height={60}
                className="rounded-full mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{testimonials[activeIndex].name}</h3>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonials[activeIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground italic">"{testimonials[activeIndex].text}"</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === activeIndex ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
