"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, Clock, Search, AlertTriangle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { getPublishedBlogs } from "@/lib/blog-service"
import type { Blog } from "@/types/blog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BlogCardSkeleton, FeaturedBlogSkeleton } from "@/components/blog/blog-skeleton"

// Fallback blog data in case Firestore fails or is empty
const fallbackBlogs: Blog[] = [
  {
    id: "fallback-1",
    title: "Top 7 Underrated Travel Destinations to Explore with TripWiser",
    excerpt:
      "Discover hidden gems that are just as mesmerizing as popular tourist spots, while keeping your trip affordable and stress-free with TripWiser's smart travel planner.",
    content: "This is a fallback blog post content.",
    image: "/placeholder.svg?height=400&width=600",
    date: new Date().toISOString(),
    readTime: "6 min read",
    author: {
      name: "Sarah Johnson",
      avatar: "",
      bio: "",
    },
    category: "Destinations",
    tags: ["travel", "destinations", "budget"],
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    title: "How to Plan a Stress-Free Trip with TripWiser: Step-by-Step Travel Guide",
    excerpt:
      "Planning a trip should be exciting—not overwhelming. From juggling budgets to organizing itineraries, learn how TripWiser simplifies every aspect of your journey.",
    content: "This is a fallback blog post content.",
    image: "/placeholder.svg?height=400&width=600",
    date: new Date().toISOString(),
    readTime: "5 min read",
    author: {
      name: "Michael Chen",
      avatar: "",
      bio: "",
    },
    category: "Travel Tips",
    tags: ["planning", "guide", "tips"],
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    title: "Budget Travel Made Easy: How to Explore the World Without Breaking the Bank",
    excerpt:
      "Dreaming of travel but worried about expenses? Whether you're a student, solo backpacker, or budget-savvy globetrotter, TripWiser is your ultimate partner for affordable travel planning.",
    content: "This is a fallback blog post content.",
    image: "/placeholder.svg?height=400&width=600",
    date: new Date().toISOString(),
    readTime: "4 min read",
    author: {
      name: "Josh Birmingham",
      avatar: "",
      bio: "",
    },
    category: "Budget Travel",
    tags: ["budget", "travel", "tips"],
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultCategories = [
  "All",
  "Destinations",
  "Travel Tips",
  "Budget Travel",
  "Food & Drink",
  "Sustainable Travel",
  "Group Travel",
  "Digital Nomad",
]

export default function BlogPageClient() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPosts, setFilteredPosts] = useState<Blog[]>([])
  const [featuredPost, setFeaturedPost] = useState<Blog | null>(null)
  const [categories, setCategories] = useState<string[]>(["All"])
  const headerRef = useRef<HTMLDivElement>(null)
  const [useFallback, setUseFallback] = useState(false)

  // Fetch blogs on component mount
  const fetchBlogs = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching published blogs...")
      const result = await getPublishedBlogs()

      if (result.success) {
        console.log(`Fetched ${result.data.length} published blogs`)

        if (result.data.length > 0) {
          setBlogs(result.data)
          setUseFallback(false)
        } else {
          console.log("No published blogs found, using fallback data")
          setBlogs(fallbackBlogs)
          setUseFallback(true)
        }
      } else {
        console.error("Failed to fetch blogs:", result.error)
        setError(result.error?.toString() || "Failed to fetch published blogs")
        setBlogs(fallbackBlogs)
        setUseFallback(true)
      }
    } catch (err) {
      console.error("Error fetching blogs:", err)
      setError("An unexpected error occurred while fetching blogs")
      setBlogs(fallbackBlogs)
      setUseFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  // Extract categories from blogs
  useEffect(() => {
    if (blogs.length > 0) {
      // Get unique categories from blogs
      const blogCategories = [...new Set(blogs.map((blog) => blog.category))].filter(Boolean)

      // If using fallback, use default categories
      if (useFallback) {
        setCategories(defaultCategories)
      } else {
        // Otherwise use categories from actual blogs
        setCategories(["All", ...blogCategories])
      }
    }
  }, [blogs, useFallback])

  // Set featured post when blogs are loaded
  useEffect(() => {
    if (blogs.length > 0) {
      // Sort blogs by date (newest first) and pick the first one as featured
      const sortedBlogs = [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setFeaturedPost(sortedBlogs[0])
    }
  }, [blogs])

  // Filter posts based on category and search query
  useEffect(() => {
    if (blogs.length === 0) return

    let filtered = [...blogs]

    // Remove the featured post from the regular list if it exists
    if (featuredPost) {
      filtered = filtered.filter((post) => post.id !== featuredPost.id)
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    setFilteredPosts(filtered)
  }, [selectedCategory, searchQuery, blogs, featuredPost])

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid date"
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
            ref={headerRef}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Explore Articles for Smart Travelers</h1>
            <p className="text-muted-foreground text-lg">
              Discover travel inspiration, practical tips, and stories from around the world to help you plan your next
              adventure.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 py-6 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-1/2 justify-center md:justify-end">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-transparent"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-16">
              <FeaturedBlogSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={fetchBlogs} className="ml-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Fallback Notice */}
          {useFallback && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <Alert className="max-w-2xl mx-auto">
                <AlertDescription>
                  Showing sample blog posts. These are not actual blog posts from the database.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Featured Post */}
          {!loading && featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="h-[400px] lg:h-[600px] relative rounded-2xl overflow-hidden">
                  <Image
                    src={featuredPost.image || "/placeholder.svg?height=600&width=800"}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = "/placeholder.svg?height=600&width=800"
                    }}
                  />
                </div>
                <div className="p-6 lg:p-8">
                  <div className="inline-flex items-center rounded-full bg-black/5 dark:bg-white/5 px-3 py-1 text-xs font-medium mb-4 uppercase tracking-wider">
                    Featured
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{featuredPost.title}</h2>
                  <p className="text-muted-foreground mb-6 text-lg">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(featuredPost.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center text-black dark:text-white font-medium hover:underline"
                  >
                    Read Article
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Blog Posts Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      className="group bg-white dark:bg-black rounded-2xl overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-900"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      exit={{ opacity: 0, y: -20 }}
                      layout
                    >
                      <div className="relative h-60 overflow-hidden">
                        <Image
                          src={post.image || "/placeholder.svg?height=400&width=600"}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-black/90 px-3 py-1 text-xs font-medium uppercase tracking-wider">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
                          <Link href={`/blog/${post.id}`}>{post.title}</Link>
                        </h3>
                        <p className="text-muted-foreground mb-4 flex-grow text-sm">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(post.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <motion.div
                    className="col-span-full text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-muted-foreground mb-4">No posts found matching your criteria.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCategory("All")
                        setSearchQuery("")
                      }}
                      className="rounded-full"
                    >
                      Reset Filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
