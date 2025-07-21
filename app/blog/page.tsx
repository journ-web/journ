import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, seoKeywords } from "@/lib/seo"
import BlogPageClient from "./BlogPageClient"

export const metadata: Metadata = generateSEOMetadata({
  title: "Travel Blog - Expert Tips & Destination Guides",
  description:
    "Discover expert travel tips, destination guides, and insider secrets to make your next trip unforgettable. From budget travel to luxury experiences.",
  keywords: [
    ...seoKeywords.travel,
    ...seoKeywords.general,
    "travel blog",
    "destination guides",
    "travel tips",
    "travel inspiration",
    "travel stories",
    "travel advice",
    "vacation ideas",
    "travel experiences",
  ],
  url: "/blog",
  type: "website",
})

export default function BlogPage() {
  return <BlogPageClient />
}
