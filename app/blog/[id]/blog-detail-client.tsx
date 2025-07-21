"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CalendarIcon, Clock, User, ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { getBlogById } from "@/lib/blog-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Blog } from "@/types/blog"

interface BlogDetailClientProps {
  blogId: string
  initialBlog?: Blog | null
}

export default function BlogDetailClient({ blogId, initialBlog }: BlogDetailClientProps) {
  const [blog, setBlog] = useState<Blog | null>(initialBlog || null)
  const [loading, setLoading] = useState(!initialBlog)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialBlog) {
      async function fetchBlog() {
        setLoading(true)
        try {
          const result = await getBlogById(blogId)
          if (result.success && result.data) {
            setBlog(result.data)
            setError(null)
          } else {
            setError(result.error?.toString() || "Failed to fetch blog post")
            setBlog(null)
          }
        } catch (err) {
          console.error("Error fetching blog:", err)
          setError("An unexpected error occurred while fetching the blog post")
          setBlog(null)
        } finally {
          setLoading(false)
        }
      }

      fetchBlog()
    }
  }, [blogId, initialBlog])

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

  // Sanitize and prepare HTML content for safe rendering
  const sanitizeContent = (content: string) => {
    // Basic sanitization - remove script tags and other potentially harmful elements
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
  }

  return (
    <main className="min-h-screen pt-20">
      <Header />

      <section className="py-16 md:py-24">
        <div className="container px-6 md:px-12">
          <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all articles
          </Link>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant="destructive" className="max-w-3xl mx-auto mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}.{" "}
                <Link href="/blog" className="underline">
                  Return to blog
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Blog Content */}
          {!loading && !error && blog && (
            <>
              <div className="max-w-3xl mx-auto mb-8">
                <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{blog.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{blog.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(blog.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>
              </div>

              <div className="relative h-[300px] md:h-[500px] w-full max-w-5xl mx-auto mb-12 rounded-xl overflow-hidden">
                <Image
                  src={blog.image || "/placeholder.svg?height=800&width=1200"}
                  alt={`${blog.title} - Travel Guide Image`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="max-w-3xl mx-auto">
                {/* Rich Text Content with proper HTML rendering */}
                <div
                  className="prose dark:prose-invert prose-lg max-w-none blog-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeContent(blog.content),
                  }}
                />

                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-12 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {blog.author.bio && (
                  <div className="mt-12 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-2">About the Author</h3>
                    <div className="flex items-start gap-4">
                      {blog.author.avatar && (
                        <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={blog.author.avatar || "/placeholder.svg"}
                            alt={`${blog.author.name} - Travel Expert`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{blog.author.name}</h4>
                        <p className="text-muted-foreground">{blog.author.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="max-w-3xl mx-auto mt-12 pt-6 border-t">
                <Button asChild>
                  <Link href="/blog">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all articles
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />

      {/* Custom styles for blog content */}
      <style jsx global>
        {`
  .blog-content {
    line-height: 1.7;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: inherit;
  }
  
  .blog-content h1 {
    font-size: 2.25rem;
    font-weight: 700;
    margin: 2rem 0 1rem 0;
    line-height: 1.2;
    color: inherit;
  }
  
  .blog-content h2 {
    font-size: 1.875rem;
    font-weight: 600;
    margin: 1.75rem 0 0.75rem 0;
    line-height: 1.3;
    color: inherit;
  }
  
  .blog-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.5rem 0 0.5rem 0;
    line-height: 1.4;
    color: inherit;
  }
  
  .blog-content p {
    margin: 1rem 0;
    line-height: 1.7;
    color: inherit;
  }
  
  .blog-content strong, .blog-content b {
    font-weight: 700 !important;
    color: inherit;
  }
  
  .blog-content em, .blog-content i {
    font-style: italic !important;
    color: inherit;
  }
  
  .blog-content u {
    text-decoration: underline !important;
    color: inherit;
  }
  
  .blog-content a {
    color: #3b82f6 !important;
    text-decoration: underline !important;
    transition: color 0.2s ease;
    cursor: pointer;
  }
  
  .blog-content a:hover {
    color: #1d4ed8 !important;
  }
  
  .dark .blog-content a {
    color: #60a5fa !important;
  }
  
  .dark .blog-content a:hover {
    color: #93c5fd !important;
  }
  
  .blog-content ul, .blog-content ol {
    margin: 1rem 0;
    padding-left: 2rem;
    color: inherit;
  }
  
  .blog-content li {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: inherit;
  }
  
  .blog-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1.5rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #6b7280;
    background: #f9fafb;
    padding: 1rem 1.5rem;
    border-radius: 0.375rem;
  }
  
  .dark .blog-content blockquote {
    border-left-color: #374151;
    background: #1f2937;
    color: #9ca3af;
  }
  
  .blog-content div[style*="text-align: center"] {
    text-align: center;
  }
  
  .blog-content div[style*="text-align: right"] {
    text-align: right;
  }
  
  .blog-content div[style*="text-align: left"] {
    text-align: left;
  }
  
  /* Ensure all text elements inherit proper colors */
  .blog-content * {
    color: inherit;
  }
  
  /* Override any inline styles that might set black text */
  .blog-content span,
  .blog-content div,
  .blog-content p,
  .blog-content h1,
  .blog-content h2,
  .blog-content h3,
  .blog-content h4,
  .blog-content h5,
  .blog-content h6 {
    color: inherit !important;
  }
  
  /* Specific dark mode text colors */
  .dark .blog-content {
    color: #f9fafb;
  }
  
  .dark .blog-content *:not(a):not(blockquote) {
    color: #f9fafb !important;
  }
  
  @media (max-width: 768px) {
    .blog-content h1 {
      font-size: 1.875rem;
    }
    
    .blog-content h2 {
      font-size: 1.5rem;
    }
    
    .blog-content h3 {
      font-size: 1.25rem;
    }
    
    .blog-content {
      font-size: 16px;
    }
  }
`}
      </style>
    </main>
  )
}
