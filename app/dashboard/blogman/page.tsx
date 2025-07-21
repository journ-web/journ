"use client"

import { useState, useEffect } from "react"
import { useBlogs } from "@/hooks/use-blogs"
import { BlogList } from "@/components/dashboard/blogman/blog-list"
import { BlogForm } from "@/components/dashboard/blogman/blog-form"
import { UnauthorizedAccess } from "@/components/dashboard/blogman/unauthorized-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { FileText, CheckCircle, XCircle, RefreshCw, PlusCircle } from "lucide-react"
import type { Blog, BlogFormData } from "@/types/blog"
import { useAuth } from "@/contexts/auth-context"

export default function BlogManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const { blogs, loading, error, fetchAllBlogs, addBlog, editBlog, removeBlog } = useBlogs()
  const [activeTab, setActiveTab] = useState("list")
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch all blogs on component mount
  useEffect(() => {
    if (user && !authLoading) {
      fetchAllBlogs()
    }
  }, [fetchAllBlogs, user, authLoading])

  // Handle blog creation
  const handleCreateBlog = async (data: BlogFormData) => {
    setIsSubmitting(true)
    try {
      const result = await addBlog(data)
      if (result.success) {
        toast({
          title: "Blog created",
          description: "Your blog post has been created successfully.",
        })
        setActiveTab("list")
      } else {
        toast({
          title: "Error",
          description: "Failed to create blog post. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating blog:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle blog update
  const handleUpdateBlog = async (data: BlogFormData) => {
    if (!editingBlog) return

    setIsSubmitting(true)
    try {
      const result = await editBlog(editingBlog.id, data)
      if (result.success) {
        toast({
          title: "Blog updated",
          description: "Your blog post has been updated successfully.",
        })
        setActiveTab("list")
        setEditingBlog(null)
      } else {
        toast({
          title: "Error",
          description: "Failed to update blog post. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating blog:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle blog deletion
  const handleDeleteBlog = async (blogId: string) => {
    try {
      const result = await removeBlog(blogId)
      if (result.success) {
        toast({
          title: "Blog deleted",
          description: "Your blog post has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete blog post. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle edit button click
  const handleEditClick = (blog: Blog) => {
    setEditingBlog(blog)
    setActiveTab("edit")
  }

  // Handle new blog button click
  const handleNewBlogClick = () => {
    setEditingBlog(null)
    setActiveTab("create")
  }

  // Count published and draft blogs
  const publishedCount = blogs.filter((blog) => blog.published).length
  const draftCount = blogs.filter((blog) => !blog.published).length

  // If user is not authorized, show unauthorized access component
  if (!authLoading && !user) {
    return <UnauthorizedAccess />
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Blog Management</h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
            <p className="text-xs text-muted-foreground">
              {blogs.length === 1 ? "1 blog post" : `${blogs.length} blog posts`} in total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCount === 1 ? "1 published post" : `${publishedCount} published posts`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
            <XCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">
              {draftCount === 1 ? "1 draft post" : `${draftCount} draft posts`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchAllBlogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Blog Management Tabs */}
      {!loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">Blog List</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            {editingBlog && <TabsTrigger value="edit">Edit Blog</TabsTrigger>}
          </TabsList>

          <TabsContent value="list">
            {blogs.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Blog Posts Yet</CardTitle>
                  <CardDescription>Get started by creating your first blog post.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleNewBlogClick}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Blog Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <BlogList
                blogs={blogs}
                onEdit={handleEditClick}
                onDelete={handleDeleteBlog}
                onCreateNew={handleNewBlogClick}
              />
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Blog Post</CardTitle>
                <CardDescription>Fill in the details to create a new blog post.</CardDescription>
              </CardHeader>
              <CardContent>
                <BlogForm onSubmit={handleCreateBlog} isSubmitting={isSubmitting} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            {editingBlog && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Blog Post</CardTitle>
                  <CardDescription>Update the details of your blog post.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BlogForm initialData={editingBlog} onSubmit={handleUpdateBlog} isSubmitting={isSubmitting} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
