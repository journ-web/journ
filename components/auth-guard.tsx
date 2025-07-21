"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation" // Import useRouter
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter() // Initialize useRouter

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/blog",
    "/support",
    "/privacy",
    "/terms",
    "/cookies",
    "/contact",
    "/about",
  ]

  // Check if current route is public or a blog post
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/blog/")

  useEffect(() => {
    // If not loading, no user, and not a public route, redirect to login
    if (!loading && !user && !isPublicRoute) {
      router.push("/login")
    }
  }, [user, loading, isPublicRoute, router]) // Add router to dependency array

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user is null and not a public route, and we are not loading,
  // it means a redirect is pending or has just happened.
  // Return null to prevent rendering children in an unauthenticated state.
  if (!user && !isPublicRoute) {
    return null
  }

  // Render children for public routes or authenticated users
  return <>{children}</>
}
