import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock } from "lucide-react"
import type { Blog } from "@/types/blog"
import { format } from "date-fns"

interface BlogCardProps {
  blog: Blog
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.id}`} className="block">
      <div className="bg-white dark:bg-black rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-900 h-full flex flex-col">
        <div className="relative w-full aspect-video">
          <Image
            src={blog.image || "/placeholder.svg?height=400&width=600&text=Blog+Image"}
            alt={blog.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{blog.category}</Badge>
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">{blog.excerpt}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>{format(new Date(blog.date), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{blog.readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
