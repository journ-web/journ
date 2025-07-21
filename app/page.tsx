"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Map,
  BarChart3,
  CheckCircle2,
  Users,
  Calendar,
  CreditCard,
  BookOpen,
  ExternalLink,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useTheme } from "next-themes"
import { getPublishedBlogs } from "@/lib/blog-service"
import type { Blog } from "@/types/blog"

// Feature card component
const FeatureCard = ({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode
  title: string
  description: string
  index: number
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl light-mode-card light-mode-hover-border transition-all duration-300 light-mode-shadow"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50" />
      <div className="p-6 relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-[#111] rounded-full w-fit text-blue-600">{icon}</div>
          <h3 className="text-xl font-semibold light-mode-text">{title}</h3>
        </div>
        <p className="light-mode-muted leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// Section title component
const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
      className="mb-16 md:mb-24 text-center"
    >
      <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight light-mode-text">{title}</h2>
      <p className="light-mode-muted max-w-2xl mx-auto text-lg">{subtitle}</p>
    </motion.div>
  )
}

// Guide card component
const GuideCard = ({
  title,
  description,
  icon,
  link,
  index,
}: {
  title: string
  description: string
  icon: React.ReactNode
  link: string
  index: number
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="light-mode-card p-6 rounded-xl light-mode-hover-border transition-all duration-300 flex flex-col" // Added flex flex-col
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-[#111] flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <h3 className="font-semibold text-lg light-mode-text">{title}</h3>
      </div>
      <p className="light-mode-muted mb-4 text-sm flex-grow min-h-[4.5rem]">{description}</p>{" "}
      {/* Added flex-grow min-h-[4.5rem] */}
      <Link
        href={link}
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-auto" // Added mt-auto
      >
        Read more <ExternalLink className="ml-1 h-3 w-3" />
      </Link>
    </motion.div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef(null)
  // Removed useScroll and useTransform related to scale
  const { theme } = useTheme()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [blogsLoading, setBlogsLoading] = useState(true)

  // Removed scale transform

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch blogs for the guides section
  useEffect(() => {
    const fetchBlogs = async () => {
      setBlogsLoading(true)
      try {
        const result = await getPublishedBlogs()
        if (result.success && result.data.length > 0) {
          setBlogs(result.data.slice(0, 4)) // Show only first 4 blogs
        }
      } catch (error) {
        console.error("Error fetching blogs:", error)
      } finally {
        setBlogsLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const features = [
    {
      icon: <Map className="h-6 w-6" />,
      title: "Trip Managing", // Renamed from "Trip Planning"
      description: "Create detailed itineraries with day-by-day activities, accommodations, and transportation.",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Expense Tracking",
      description: "Track expenses across multiple currencies with automatic conversion and budget management.",
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Task Management",
      description: "Organize pre-trip tasks and daily activities with customizable checklists and reminders.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Splitly",
      description: "Split expenses with travel companions, track balances, and settle up with ease.",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Travel Journal",
      description: "Document your journey with photos, notes, and memories organized by date and location.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Smart Insights",
      description: "Visualize spending patterns, travel trends, and budget performance with interactive analytics.",
    },
  ]

  const guides = [
    {
      icon: <Map className="h-5 w-5" />,
      title: "Top 7 Underrated Travel Destinations to Explore with Journve",
      description:
        "Discover hidden gems that are just as mesmerizing as popular tourist spots, while keeping your trip affordable and stress-free.",
      link: "/blog/1",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "How to Plan a Stress-Free Trip with Journve: Step-by-Step Travel Guide",
      description:
        "Planning a trip should be exciting—not overwhelming. Learn how Journve simplifies every aspect of your journey.",
      link: "/blog/2",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Budget Travel Made Easy: How to Explore the World Without Breaking the Bank",
      description:
        "Dreaming of travel but worried about expenses? Journve is your ultimate partner for affordable travel planning.",
      link: "/blog/3",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Taste the World: How Journve Helps You Explore Local Food & Drink on Every Trip",
      description:
        "Travel isn't just about places—it's about flavors, aromas, and food stories. Every bite is part of the journey.",
      link: "/blog/4",
    },
  ]

  const displayGuides =
    blogs.length > 0
      ? blogs.map((blog) => ({
          icon: <BookOpen className="h-5 w-5" />,
          title: blog.title,
          description: blog.excerpt,
          link: `/blog/${blog.id}`,
        }))
      : guides // fallback to static guides

  if (!mounted) return null

  return (
    <main className="min-h-screen light-mode-bg">
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/20 to-transparent blur-[100px] opacity-30" />
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-blue-500/20 to-transparent blur-[100px] opacity-20" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>

        <div className="container relative z-10 px-6 md:px-12 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight light-mode-text"
            >
              Your Smartest Travel <br />
              Companion{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">Awaits</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl light-mode-muted mb-8 max-w-2xl mx-auto"
            >
              No chaos. No clutter. Just travel, made simple.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0 text-white"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 light-mode-button-outline bg-transparent"
                >
                  Explore Features
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="relative mx-auto max-w-5xl"
            // Removed style={{ scale }}
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl dark:shadow-blue-500/20 dark:shadow-2xl">
              {/* Glow effect instead of border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl blur-lg opacity-70 animate-pulse"></div>
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src="/images/header.webp"
                  alt="Journve Trip Planner Interface - Travel Planning Made Easy"
                  width={1400}
                  height={800}
                  className="w-full h-auto" // Removed transform transition-transform duration-10000 hover:scale-110
                  priority
                />
              </div>
            </div>

            <div className="absolute -bottom-5 -right-5 md:-bottom-8 md:-right-8 light-mode-card p-3 md:p-4 shadow-xl">
              <div className="flex items-center gap-2 text-sm md:text-base light-mode-text">
                <div className="h-3 w-3 rounded-full bg-blue-600" />
                <span>Experience hassle-free management</span> {/* Updated text */}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos Section */}
      {/* Commented out the entire section */}
      {/*
      <section className="py-12 light-mode-border border-y light-mode-card">
        <div className="container px-6 md:px-12 mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="opacity-50 hover:opacity-100 transition-opacity">
                <Image
                  src={`/placeholder.svg?height=30&width=120&text=Partner${i}`}
                  alt={`Travel Partner ${i}`}
                  width={120}
                  height={30}
                  className="h-6 md:h-8 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Not everything powerful has to look complicated */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-30" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-20" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>

        <div className="container px-6 md:px-12 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 light-mode-text">
              Not everything powerful has to look complicated
            </h2>
            <p className="light-mode-muted">
              A travel managing platform that puts you in control without overwhelming you with options.{" "}
              {/* Updated text */}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-xl overflow-hidden light-mode-border border shadow-xl dark:shadow-blue-500/20 dark:shadow-xl"
            >
              <Image
                src="/images/reimagine.webp"
                alt="Journve Travel Insights and Analytics Interface"
                width={600}
                height={600}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-6 light-mode-text">Reimagine How You Travel</h3>
              <p className="light-mode-muted mb-8">
                Journve combines powerful planning tools, expense tracking, and collaborative features to transform your
                travel experience from start to finish.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium light-mode-text">Seamless Planning</h3>
                    <p className="text-sm light-mode-muted">
                      Create detailed itineraries with accommodations, activities, and transportation in one place.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium light-mode-text">Smart Budgeting</h3>
                    <p className="text-sm light-mode-muted">
                      Track expenses across currencies, visualize spending, and stay within your budget.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium light-mode-text">Collaborative Travel</h3>
                    <p className="text-sm light-mode-muted">
                      Share plans, split expenses, and coordinate with travel companions effortlessly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple to learn, easy to master */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="container px-6 md:px-12 mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 light-mode-text">Simple to learn, easy to master</h2>
              <p className="light-mode-muted mb-8">
                Whether you're planning your first weekend getaway or your twentieth international expedition, Journve
                scales with your needs and grows with your experience.
              </p>
              <div className="light-mode-card rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-medium light-mode-text">Master the Fundamentals</h3>
                </div>
                <p className="text-sm light-mode-muted">
                  Our intuitive interface and guided tutorials help you get started in minutes, not hours.
                </p>
                <Link
                  href="/signup"
                  className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Get started <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-xl overflow-hidden shadow-xl dark:shadow-blue-500/20 dark:shadow-xl"
            >
              <Image
                src="/images/simpler.webp"
                alt="Journve Trip Planning Interface - Easy to Use Travel Planner"
                width={600}
                height={600}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-30" />
          <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-20" />
        </div>

        <div className="container px-6 md:px-12 mx-auto relative z-10">
          <SectionTitle
            title="Powerful Features for Every Traveler"
            subtitle="Discover the tools that make Journve the ultimate travel companion for planning, experiencing, and remembering your journeys."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Guides & Tips Section */}
      <section className="py-24 md:py-32 bg-gray-50 dark:bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="relative z-10">
          <div className="container px-6 md:px-12 mx-auto mb-16">
            <SectionTitle
              title="Discover Journve & Travel Smarter"
              subtitle="Explore our comprehensive guides and expert tips designed to enhance every aspect of your travel experience."
            />
          </div>

          {/* Full-width video section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full mb-20"
          >
            <div className="aspect-video max-w-6xl mx-auto relative overflow-hidden rounded-xl shadow-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl blur-md opacity-50"></div>
              <div className="relative h-full w-full rounded-xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/i992fiWPCXI"
                  title="Journve Travel Planning Tips and Tutorials"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full object-cover"
                ></iframe>
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-gray-50/80 dark:from-[#050505]/80 to-transparent h-16 bottom-0 top-auto"></div>
          </motion.div>

          {/* Guides below the video */}
          <div className="container px-6 md:px-12 mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-[#111] flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold light-mode-text">Travel Guides & Resources</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {blogsLoading
                  ? // Loading skeleton
                    Array(4)
                      .fill(0)
                      .map((_, index) => (
                        <div key={index} className="light-mode-card p-6 rounded-xl animate-pulse">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                      ))
                  : displayGuides.map((guide, index) => (
                      <GuideCard
                        key={index}
                        title={guide.title}
                        description={guide.description}
                        icon={guide.icon}
                        link={guide.link}
                        index={index}
                      />
                    ))}
              </div>
            </div>

            <div className="text-center">
              <Link href="/blog">
                <Button variant="outline" className="rounded-full px-6 light-mode-button-outline bg-transparent">
                  View All Guides
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Start with a Template */}
      <section className="py-24 md:py-32 light-mode-bg relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="container px-6 md:px-12 mx-auto relative z-10">
          <SectionTitle
            title="Start with a Template, level up with Plugins"
            subtitle="Begin your journey with our pre-designed templates and enhance your experience with powerful plugins."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { color: "bg-blue-600", title: "Europe" },
              { color: "bg-blue-600", title: "Asia" },
              { color: "bg-blue-600", title: "Americas" },
              { color: "bg-blue-600", title: "Africa" },
            ].map((template, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl light-mode-card light-mode-hover-border transition-all duration-300 light-mode-shadow"
              >
                <div className={`absolute inset-0 ${template.color}/10 opacity-50`} />
                <div className="p-6 relative z-10">
                  <div className={`h-10 w-10 rounded-lg ${template.color}/20 flex items-center justify-center mb-4`}>
                    <Map className={`h-5 w-5 text-blue-600`} />
                  </div>
                  <h3 className="text-lg font-medium mb-2 light-mode-text">{template.title}</h3>
                  <p className="text-sm light-mode-muted mb-4">Perfect for {template.title} adventures</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-[#777]">
                    <span className="mr-3">Template</span>
                    <span>Free</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="rounded-full px-6 light-mode-button-outline cursor-not-allowed opacity-70 bg-transparent"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-blue-500/20 to-blue-500/20 blur-[150px] opacity-30" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>

        <div className="container px-6 md:px-12 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative mx-auto mb-12 w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-600 rounded-full blur-[30px] opacity-30 animate-pulse" />
              <div className="relative bg-white dark:bg-[#111] border light-mode-border rounded-2xl p-4">
                <Map className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold mb-6 tracking-tight light-mode-text"
            >
              Step into the
              <br />
              future of travel
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="light-mode-muted mb-8 text-lg"
            >
              Join thousands of travelers who use Journve to plan better, spend smarter, and create lasting memories.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0 text-white"
                >
                  Start Your Journey
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
