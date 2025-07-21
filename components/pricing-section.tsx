"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const freePlan = {
    name: "Free",
    description: "Essential tools for occasional travelers",
    price: "$0",
    features: [
      { name: "Currency Converter (150+ currencies)", included: true },
      { name: "Basic Expense Tracking", included: true },
      { name: "ATM Locator", included: true },
      { name: "Trip Planning (Basic)", included: true },
      { name: "AI Budgeting", included: false },
      { name: "Offline Mode", included: false },
      { name: "Split Bills", included: false },
    ],
  }

  const proPlan = {
    name: "Premium",
    description: "Advanced features for frequent travelers",
    price: billingCycle === "monthly" ? "$5.99" : "$59.88",
    features: [
      { name: "Everything in Free plan", included: true },
      { name: "AI Budgeting", included: true },
      { name: "Offline Mode", included: true },
      { name: "Split Bills", included: true },
      { name: "Google Maps Integration", included: true },
      { name: "Advanced Reports & Analytics", included: true },
      { name: "Priority Support", included: true },
    ],
    popular: true,
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900" id="pricing">
      <div className="container px-4 md:px-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for your travel needs. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full inline-flex">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "monthly" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "yearly" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly (Save 17%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-8"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">{freePlan.name}</h3>
              <p className="text-sm text-muted-foreground">{freePlan.description}</p>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold">
                {freePlan.price} <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {freePlan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/pricing">Get Started</Link>
            </Button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-8 relative"
          >
            {proPlan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-black text-white dark:bg-white dark:text-black text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Popular
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">{proPlan.name}</h3>
              <p className="text-sm text-muted-foreground">{proPlan.description}</p>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold">
                {proPlan.price} <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {proPlan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-primary" asChild>
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </motion.div>
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-primary hover:underline inline-flex items-center">
            View full pricing details
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
