"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function JoinCommunityButton() {
  const pathname = usePathname()
  const isDashboardPage = pathname.startsWith("/dashboard")

  if (isDashboardPage) {
    return null
  }

  return (
    <Link
      href="https://t.me/+PJ7oqbhQ2W9kY2Zl"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex items-center gap-2 px-4 py-2 rounded-full shadow-lg",
        "bg-blue-500 text-white hover:bg-blue-600 transition-colors",
        "text-sm font-medium md:text-base",
      )}
    >
      <MessageSquare className="h-5 w-5" />
      <span>Join Journve community</span>
    </Link>
  )
}
