"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, ChevronDown, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// FAQ categories and questions
const faqCategories = [
  {
    id: "trip-planner",
    name: "Trip Planner",
    questions: [
      {
        id: "create-new-trip",
        question: "How do I create a new trip?",
        answer: 'Go to the Trip Planner and tap the "+ Add Trip" button.',
      },
      {
        id: "edit-trip",
        question: "Can I edit a trip after it's been created?",
        answer: "Yes, ongoing and planned trips can be edited anytime.",
      },
      {
        id: "trip-types",
        question: "What's the difference between ongoing, planned, and completed trips?",
        answer: "Ongoing is your current trip, planned is upcoming, and completed is past.",
      },
      {
        id: "change-currency",
        question: "Can I change the trip currency or budget later?",
        answer: "Yes, unless the trip is marked as completed.",
      },
      {
        id: "delete-trip",
        question: "How do I delete or archive a trip?",
        answer: 'Open the trip, click the options menu, and select "Delete" or "Archive".',
      },
    ],
  },
  {
    id: "expense-tracking",
    name: "Expense Tracking",
    questions: [
      {
        id: "add-expense",
        question: "How do I add a new expense to my trip?",
        answer: 'Go to the trip, open the "Expenses" tab, and tap "+ Add Expense".',
      },
      {
        id: "edit-expense",
        question: "Can I edit or delete past expenses?",
        answer: "Yes, but only in ongoing trips.",
      },
      {
        id: "budget-vs-safety",
        question: "What is the difference between Trip Budget and Safety Funds?",
        answer: "Trip Budget is your main spending pool; Safety Funds are backup.",
      },
      {
        id: "track-by-category",
        question: "How do I track expenses by category or date?",
        answer: "Use filters in the Expense Tracker to view by category/date.",
      },
      {
        id: "expense-summary",
        question: "Can I view a summary of all my expenses?",
        answer: "Yes, each trip shows a budget summary and detailed breakdown.",
      },
    ],
  },
  {
    id: "splitly",
    name: "Splitly",
    questions: [
      {
        id: "create-splitly",
        question: "How do I create a Splitly group?",
        answer: 'Go to Splitly and tap "Create Group".',
      },
      {
        id: "personal-to-splitly",
        question: "Can I add a personal expense to a Splitly group?",
        answer: 'Yes, use the "Add to Splitly" option on your expense card.',
      },
      {
        id: "expense-splitting",
        question: "How does expense splitting work?",
        answer: "Expenses are divided equally or custom among selected group members.",
      },
      {
        id: "uneven-split",
        question: "Can I split an expense unevenly?",
        answer: 'Yes, use the "Custom Split" option while adding the expense.',
      },
      {
        id: "settle-up",
        question: "How do I settle up with group members?",
        answer: "The app shows who owes whom; settle offline and mark as settled.",
      },
    ],
  },
  {
    id: "account-settings",
    name: "Account Settings",
    questions: [
      {
        id: "change-name",
        question: "How do I change my display name?",
        answer: "Go to Settings and edit your name in the profile section.",
      },
      {
        id: "update-email",
        question: "Can I update my email address?",
        answer: "Not currently. Email is tied to Google Sign-In.",
      },
      {
        id: "delete-account",
        question: "Is there a way to delete my account?",
        answer: 'Yes, tap "Delete Account" in Settings. You\'ll be asked to confirm.',
      },
      {
        id: "theme-toggle",
        question: "How do I switch between light and dark mode?",
        answer: "Use the Appearance toggle in Settings.",
      },
      {
        id: "logout-data",
        question: "What happens to my data if I log out?",
        answer: "Your data stays saved and synced to your account.",
      },
    ],
  },
  {
    id: "general",
    name: "General",
    questions: [
      {
        id: "is-free",
        question: "Is Journve free to use?",
        answer: "Yes, all features are currently free.",
      },
      {
        id: "offline-use",
        question: "Can I use Journve without an internet connection?",
        answer: "No, it requires an internet connection to work properly.",
      },
      {
        id: "data-saved",
        question: "Will my data be saved if I close the app?",
        answer: "Yes, all changes are auto-synced with your account.",
      },
      {
        id: "multiple-trips",
        question: "How many trips can I plan at once?",
        answer: "You can create and manage multiple trips, but only one can be ongoing.",
      },
      {
        id: "data-safety",
        question: "Is my data safe and private?",
        answer: "Yes, we use Firebase for secure authentication and data storage.",
      },
    ],
  },
  {
    id: "features",
    name: "Features",
    questions: [
      {
        id: "journal-feature",
        question: "What is the Journal feature?",
        answer: "It lets you save travel memories day-wise within a trip.",
      },
      {
        id: "currency-conversion",
        question: "How does currency conversion work?",
        answer: "We fetch live exchange rates to convert expenses into trip currency.",
      },
      {
        id: "all-trips-view",
        question: "Can I see all my trips in one place?",
        answer: "Yes, your dashboard lists all your trips by status.",
      },
      {
        id: "multi-currency",
        question: "Does Journve support multi-currency tracking?",
        answer: "Yes, you can record expenses in different currencies.",
      },
      {
        id: "notifications",
        question: "Are there reminders or notifications?",
        answer: "Yes, you'll receive important trip and expense-related alerts.",
      },
    ],
  },
  {
    id: "technical",
    name: "Technical Support",
    questions: [
      {
        id: "loading-issue",
        question: "I'm facing a loading issue. What should I do?",
        answer: "Try refreshing or check your internet connection.",
      },
      {
        id: "saving-issue",
        question: "My trip details aren't saving—how do I fix this?",
        answer: "Ensure you're online and logged in, then try again.",
      },
      {
        id: "report-bug",
        question: "How do I report a bug or issue?",
        answer: "Use the Support page or email us from the app.",
      },
      {
        id: "device-compatibility",
        question: "Is Journve available on mobile and tablet?",
        answer: "Yes, it's fully responsive for all devices.",
      },
      {
        id: "contact-support",
        question: "Who can I contact for support?",
        answer: "Visit the Support section in the app or email our team.",
      },
    ],
  },
]

// Top support topics
const topSupportTopics = [
  {
    id: "trip-planner",
    title: "Trip Planning",
    description: "Learn how to create and manage your travel itineraries",
    icon: "🗺️",
  },
  {
    id: "expense-tracking",
    title: "Expense Tracking",
    description: "Track your travel expenses across multiple currencies",
    icon: "💰",
  },
  {
    id: "splitly",
    title: "Splitly",
    description: "Split expenses with your travel companions",
    icon: "👥",
  },
  {
    id: "account-settings",
    title: "Account Settings",
    description: "Manage your profile, notifications, and privacy settings",
    icon: "⚙️",
  },
]

// Flatten all questions for search
const allQuestions = faqCategories.flatMap((category) =>
  category.questions.map((q) => ({
    ...q,
    category: category.id,
    categoryName: category.name,
  })),
)

export default function SupportPageClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState(allQuestions)
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("trip-planner")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  // Simple search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(allQuestions)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allQuestions.filter(
      (q) => q.question.toLowerCase().includes(query) || q.answer.toLowerCase().includes(query),
    )

    setSearchResults(filtered)
  }, [searchQuery])

  const toggleQuestion = (id: string) => {
    setActiveQuestion(activeQuestion === id ? null : id)
  }

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send the feedback to your backend
    setFeedbackSent(true)
    setTimeout(() => setFeedbackSent(false), 3000)
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
            ref={headerRef}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">How can we help you?</h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions, get help with issues, or contact our support team.
            </p>
          </motion.div>

          {/* Top Support Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-24"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight text-center">Top Support Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topSupportTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-100 dark:border-gray-900 hover:shadow-lg transition-all duration-300 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2"
                  onClick={() => setActiveCategory(topic.id)}
                >
                  <div className="text-4xl mb-4">{topic.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                  <p className="text-muted-foreground text-sm">{topic.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for answers..."
                className="pl-12 py-6 text-lg rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-24"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight text-center">
              Frequently Asked Questions
            </h2>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={`rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-transparent"
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* FAQ Accordions */}
            <div className="max-w-3xl mx-auto">
              {searchQuery ? (
                <div className="space-y-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((question) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-black rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-900"
                      >
                        <button
                          className="flex justify-between items-center w-full p-6 text-left font-medium"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <div>
                            <span className="text-xs text-primary uppercase tracking-wider block mb-1">
                              {question.categoryName}
                            </span>
                            <span className="text-lg">{question.question}</span>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${activeQuestion === question.id ? "transform rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {activeQuestion === question.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <p className="text-muted-foreground">{question.answer}</p>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-sm text-muted-foreground">Was this helpful?</div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={() => setFeedbackSent(true)}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Yes
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={() => setFeedbackSent(true)}
                                    >
                                      <ThumbsDown className="h-4 w-4 mr-1" />
                                      No
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-gray-900">
                      <p className="text-muted-foreground mb-4">No results found for "{searchQuery}"</p>
                      <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-full">
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {faqCategories
                    .find((cat) => cat.id === activeCategory)
                    ?.questions.map((question) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-black rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-900"
                      >
                        <button
                          className="flex justify-between items-center w-full p-6 text-left font-medium"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <span className="text-lg">{question.question}</span>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${activeQuestion === question.id ? "transform rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {activeQuestion === question.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <p className="text-muted-foreground">{question.answer}</p>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-sm text-muted-foreground">Was this helpful?</div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={() => setFeedbackSent(true)}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Yes
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={() => setFeedbackSent(true)}
                                    >
                                      <ThumbsDown className="h-4 w-4 mr-1" />
                                      No
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-black text-white rounded-2xl p-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Still Need Help?</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Our support team is ready to assist you with any questions or issues you may have.
            </p>
            <Link href="/contact">
              <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-white/90">
                Contact Support
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedbackSent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-black text-white dark:bg-white dark:text-black p-4 rounded-lg shadow-lg"
          >
            Thank you for your feedback!
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
