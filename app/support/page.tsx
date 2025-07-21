import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, seoKeywords } from "@/lib/seo"
import { StructuredData } from "@/components/seo/structured-data"
import SupportPageClient from "./SupportPageClient"

export const metadata: Metadata = generateSEOMetadata({
  title: "Support & Help Center - Get Travel Planning Assistance",
  description:
    "Find answers to common questions about Journve travel planning, expense tracking, and trip management. Get help with features, troubleshooting, and more.",
  keywords: [
    "journve support",
    "travel planning help",
    "trip planner support",
    "expense tracker help",
    "travel app assistance",
    "customer support",
    "help center",
    "faq",
    "troubleshooting",
    ...seoKeywords.travel,
  ],
  url: "/support",
  type: "website",
})

import { generateStructuredData } from "@/lib/seo"
// FAQ data for structured data
const faqData = [
  {
    question: "How do I create a new trip?",
    answer: "Go to the Trip Planner and tap the '+ Add Trip' button.",
  },
  {
    question: "Can I edit a trip after it's been created?",
    answer: "Yes, ongoing and planned trips can be edited anytime.",
  },
  {
    question: "How do I add a new expense to my trip?",
    answer: "Go to the trip, open the 'Expenses' tab, and tap '+ Add Expense'.",
  },
  {
    question: "How do I create a Splitly group?",
    answer: "Go to Splitly and tap 'Create Group'.",
  },
  {
    question: "Is Journve free to use?",
    answer: "Yes, all features are currently free.",
  },
]
const faqStructuredData = generateStructuredData("faq", { faqs: faqData })

export default function SupportPage() {
  return (
    <>
      <StructuredData data={faqStructuredData} />
      <SupportPageClient />
    </>
  )
}
