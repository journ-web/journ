"use client"

import { useState, useCallback } from "react"
import { getAllBlogs, getPublishedBlogs, createBlog, updateBlog, deleteBlog } from "@/lib/blog-service"
import type { Blog, BlogFormData } from "@/types/blog"

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all blogs (admin access)
  const fetchAllBlogs = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllBlogs()
      if (result.success) {
        setBlogs(result.data)
        setError(null)
      } else {
        setError(result.error?.toString() || "Failed to fetch blogs")
      }
    } catch (err) {
      console.error("Error in fetchAllBlogs:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch published blogs only (public access)
  const fetchPublishedBlogs = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPublishedBlogs()
      if (result.success) {
        setBlogs(result.data)
        setError(null)
      } else {
        setError(result.error?.toString() || "Failed to fetch published blogs")
      }
    } catch (err) {
      console.error("Error in fetchPublishedBlogs:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new blog
  const addBlog = useCallback(
    async (blogData: BlogFormData) => {
      setLoading(true)
      try {
        const result = await createBlog(blogData)
        if (result.success) {
          // Refresh the blog list
          await fetchAllBlogs()
          return { success: true, id: result.id }
        } else {
          setError(result.error?.toString() || "Failed to create blog")
          return { success: false }
        }
      } catch (err) {
        console.error("Error in addBlog:", err)
        setError("An unexpected error occurred")
        return { success: false }
      } finally {
        setLoading(false)
      }
    },
    [fetchAllBlogs],
  )

  // Update an existing blog
  const editBlog = useCallback(
    async (blogId: string, blogData: Partial<BlogFormData>) => {
      setLoading(true)
      try {
        const result = await updateBlog(blogId, blogData)
        if (result.success) {
          // Refresh the blog list
          await fetchAllBlogs()
          return { success: true }
        } else {
          setError(result.error?.toString() || "Failed to update blog")
          return { success: false }
        }
      } catch (err) {
        console.error("Error in editBlog:", err)
        setError("An unexpected error occurred")
        return { success: false }
      } finally {
        setLoading(false)
      }
    },
    [fetchAllBlogs],
  )

  // Delete a blog
  const removeBlog = useCallback(
    async (blogId: string) => {
      setLoading(true)
      try {
        const result = await deleteBlog(blogId)
        if (result.success) {
          // Refresh the blog list
          await fetchAllBlogs()
          return { success: true }
        } else {
          setError(result.error?.toString() || "Failed to delete blog")
          return { success: false }
        }
      } catch (err) {
        console.error("Error in removeBlog:", err)
        setError("An unexpected error occurred")
        return { success: false }
      } finally {
        setLoading(false)
      }
    },
    [fetchAllBlogs],
  )

  return {
    blogs,
    loading,
    error,
    fetchAllBlogs,
    fetchPublishedBlogs,
    addBlog,
    editBlog,
    removeBlog,
  }
}
