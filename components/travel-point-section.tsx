"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function TravelPointSection() {
  const stats = [
    { value: "50+", label: "Countries" },
    { value: "450", label: "Destinations" },
    { value: "10", label: "Years Experience" },
    { value: "12k+", label: "Happy Customers" },
  ]

  return (
    <section className="py-16 md:py-24 bg-travel-gradient dark:bg-none overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image now on the left */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[300px] md:h-[400px] order-1"
          >
            <Image
              src="/placeholder.svg?height=400&width=300"
              alt="Statue of Liberty"
              width={300}
              height={400}
              className="rounded-lg shadow-lg mx-auto lg:mr-auto lg:ml-0"
            />

            {/* Decorative elements */}
            <div className="absolute top-1/4 -right-4 h-12 w-12 rounded-full bg-yellow-300 animate-float-slow opacity-80"></div>
            <div className="absolute bottom-1/3 -left-4 h-8 w-8 rounded-full bg-pink-300 animate-float-medium opacity-80"></div>
            <div className="absolute top-2/3 right-1/3 h-6 w-6 rounded-full bg-red-300 animate-float-fast opacity-80"></div>
          </motion.div>

          {/* Text now on the right */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left order-2"
          >
            <div className="inline-flex items-center rounded-full bg-white/80 dark:bg-gray-800/80 px-3 py-1 text-sm shadow-sm backdrop-blur-sm">
              <span className="text-pink-500 font-medium">TRAVEL POINT</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">We help you find your dream destination</h2>
            <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
              Discover amazing places around the world with our curated selection of destinations. We help you find the
              perfect spot for your next adventure.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
