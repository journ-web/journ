"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Here you would typically send the email to your API
      setIsSubmitted(true)
      setEmail("")
      setTimeout(() => setIsSubmitted(false), 3000)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="text-pink-300 dark:text-pink-800 text-xs">
              ✕
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="text-yellow-300 dark:text-yellow-800 text-xs">
              ✕
            </div>
          ))}
        </div>
      </div>

      <div className="container px-4 md:px-8 mx-auto relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full bg-white/80 dark:bg-gray-800/80 px-3 py-1 text-sm shadow-sm backdrop-blur-sm mb-4">
            <span className="text-pink-500 font-medium">SUBSCRIBE TO OUR NEWSLETTER</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prepare yourself and let's explore the beautiful of the world
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-8">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-grow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="bg-primary">
              Subscribe
            </Button>
          </form>

          {isSubmitted && (
            <p className="mt-4 text-green-600 dark:text-green-400">Thank you for subscribing to our newsletter!</p>
          )}
        </div>
      </div>
    </section>
  )
}
