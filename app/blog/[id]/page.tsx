import type { Metadata } from "next"
import { getBlogById } from "@/lib/blog-service"
import { generateMetadata as generateSEOMetadata, generateStructuredData } from "@/lib/seo"
import { StructuredData } from "@/components/seo/structured-data"
import BlogDetailClient from "./blog-detail-client"

interface BlogDetailPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  try {
    const result = await getBlogById(params.id)

    if (!result.success || !result.data) {
      return generateSEOMetadata({
        title: "Blog Post Not Found",
        description: "The requested blog post could not be found.",
        url: `/blog/${params.id}`,
      })
    }

    const blog = result.data

    return generateSEOMetadata({
      title: blog.title,
      description: blog.excerpt,
      keywords: [...blog.tags, blog.category.toLowerCase(), "travel guide", "travel tips", "journve blog"],
      url: `/blog/${params.id}`,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      author: blog.author.name,
      section: blog.category,
      tags: blog.tags,
      image: blog.image,
    })
  } catch (error) {
    console.error("Error generating metadata for blog:", error)
    return generateSEOMetadata({
      title: "Blog Post",
      description: "Read our latest travel insights and tips.",
      url: `/blog/${params.id}`,
    })
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  let blog = null
  let structuredData = null

  try {
    const result = await getBlogById(params.id)
    if (result.success && result.data) {
      blog = result.data
      structuredData = generateStructuredData("blog", {
        title: blog.title,
        description: blog.excerpt,
        image: blog.image,
        author: blog.author.name,
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt,
        url: `https://journve.com/blog/${params.id}`,
      })
    }
  } catch (error) {
    console.error("Error fetching blog for SSR:", error)
  }

  return (
    <>
      {structuredData && <StructuredData data={structuredData} />}
      <BlogDetailClient blogId={params.id} initialBlog={blog} />
    </>
  )
}
