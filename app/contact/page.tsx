"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      await fetch("https://formspree.io/f/xgvzvgrg", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      // Always show success message and reset form
      toast({
        title: "Request submitted",
        description: "We'll get back to you as soon as possible.",
      })
      // Reset the form
      e.currentTarget.reset()
    } catch (error) {
      // Silent error handling - no toast
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen pt-20">
      <Header />

      <section className="py-24 md:py-32">
        <div className="container px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Get in Touch</h1>
            <p className="text-muted-foreground text-lg">
              Have a question, feedback, or need assistance? We're here to help. Fill out the form below and we'll get
              back to you as soon as possible.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-black rounded-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-900 shadow-sm"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      required
                      minLength={2}
                      className="h-12 rounded-xl"
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email address"
                      required
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      className="h-12 rounded-xl"
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="What is this regarding?"
                    required
                    minLength={3}
                    className="h-12 rounded-xl"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your message"
                    required
                    minLength={10}
                    className="min-h-[150px] rounded-xl resize-y"
                    aria-required="true"
                  />
                </div>

                {/* Honeypot field to prevent spam */}
                <div className="hidden">
                  <label htmlFor="_gotcha">Don't fill this out if you're human:</label>
                  <input type="text" name="_gotcha" id="_gotcha" />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Other Ways to Reach Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-100 dark:border-gray-900">
                  <div className="text-3xl mb-4">📧</div>
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">ask.journve@gmail.com</p>
                </div>
                <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-100 dark:border-gray-900">
                  <div className="text-3xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                  <p className="text-muted-foreground mb-4">Available 9am-5pm EST</p>
                  <Button asChild className="w-full rounded-xl">
                    <a href="https://t.me/+PJ7oqbhQ2W9kY2Zl" target="_blank" rel="noopener noreferrer">
                      Chat Now
                    </a>
                  </Button>
                </div>
                <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-100 dark:border-gray-900">
                  <div className="text-3xl mb-4">📱</div>
                  <h3 className="text-lg font-semibold mb-2">Social Media</h3>
                  <p className="text-muted-foreground">@journve on all platforms</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
