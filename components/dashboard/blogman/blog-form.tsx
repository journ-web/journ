"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calendar, Clock, ImageIcon, Tag, User, AlertCircle, Check } from "lucide-react"
import type { Blog, BlogFormData } from "@/types/blog"
import { RichTextEditor } from "@/components/rich-text-editor"

// Schema for blog form validation
const blogFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters" }),
  content: z.string().min(50, { message: "Content must be at least 50 characters" }),
  image: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  date: z.string(),
  readTime: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  published: z.boolean(),
  author: z.object({
    name: z.string().min(2, { message: "Author name must be at least 2 characters" }),
    avatar: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    bio: z.string().optional(),
  }),
})

// Available categories
const categories = [
  "Destinations",
  "Travel Tips",
  "Budget Travel",
  "Food & Drink",
  "Sustainable Travel",
  "Group Travel",
  "Digital Nomad",
  "Adventure",
  "Culture",
  "Uncategorized",
]

// Available read times
const readTimes = ["2 min read", "3 min read", "5 min read", "7 min read", "10 min read", "15+ min read"]

interface BlogFormProps {
  initialData?: Blog
  onSubmit: (data: BlogFormData) => Promise<void>
  isSubmitting: boolean
}

export function BlogForm({ initialData, onSubmit, isSubmitting }: BlogFormProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialData?.image || "")
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: initialData || {
      title: "",
      excerpt: "",
      content: "",
      image: "",
      date: new Date().toISOString().split("T")[0],
      readTime: "5 min read",
      category: "Uncategorized",
      tags: [],
      published: false,
      author: {
        name: "",
        avatar: "",
        bio: "",
      },
    },
  })

  // Watch for image URL changes
  const imageUrl = watch("image")

  // Update image preview when URL changes
  useEffect(() => {
    if (imageUrl) {
      setImagePreviewUrl(imageUrl)
      setImageError(false)
    } else {
      setImagePreviewUrl("")
    }
  }, [imageUrl])

  // Update form values when tags change
  useEffect(() => {
    setValue("tags", tags)
  }, [tags, setValue])

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Handle form submission
  const onFormSubmit = (data: BlogFormData) => {
    // Ensure tags are included
    data.tags = tags
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media & Metadata</TabsTrigger>
          <TabsTrigger value="author">Author & Publishing</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-base font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter blog title"
                className={`mt-1 ${errors.title ? "border-red-500" : ""}`}
                {...register("title")}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="excerpt" className="text-base font-medium">
                Excerpt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="excerpt"
                placeholder="Enter a brief summary of the blog post"
                className={`mt-1 min-h-[100px] ${errors.excerpt ? "border-red-500" : ""}`}
                {...register("excerpt")}
              />
              {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>}
            </div>

            <div>
              <Label htmlFor="content" className="text-base font-medium">
                Content <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                <RichTextEditor
                  value={watch("content") || ""}
                  onChange={(value) => setValue("content", value)}
                  placeholder="Write your blog post content here..."
                  className={errors.content ? "border-red-500" : ""}
                />
              </div>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>
          </div>

          <Button type="button" onClick={() => setActiveTab("media")}>
            Next: Media & Metadata
          </Button>
        </TabsContent>

        {/* Media & Metadata Tab */}
        <TabsContent value="media" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="image" className="text-base font-medium flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Featured Image URL
                </Label>
                <Input
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  className={`mt-1 ${errors.image ? "border-red-500" : ""}`}
                  {...register("image")}
                />
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue={initialData?.category || "Uncategorized"}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger className={`mt-1 ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <Label htmlFor="date" className="text-base font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Publication Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  className={`mt-1 ${errors.date ? "border-red-500" : ""}`}
                  {...register("date")}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <Label htmlFor="readTime" className="text-base font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Read Time <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue={initialData?.readTime || "5 min read"}
                  onValueChange={(value) => setValue("readTime", value)}
                >
                  <SelectTrigger className={`mt-1 ${errors.readTime ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select read time" />
                  </SelectTrigger>
                  <SelectContent>
                    {readTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.readTime && <p className="text-red-500 text-sm mt-1">{errors.readTime.message}</p>}
              </div>

              <div>
                <Label htmlFor="tags" className="text-base font-medium flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </Label>
                <div className="flex mt-1">
                  <Input
                    id="tagInput"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="rounded-r-none"
                  />
                  <Button type="button" onClick={handleAddTag} className="rounded-l-none">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Image Preview</Label>
              <Card className="mt-1 overflow-hidden">
                <CardContent className="p-0">
                  {imagePreviewUrl ? (
                    <div className="relative aspect-video">
                      <img
                        src={imagePreviewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImageError(true)
                          setImagePreviewUrl("/placeholder.svg?height=400&width=600")
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
                {imageError && (
                  <CardFooter className="p-2 bg-red-50 dark:bg-red-900/20">
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Image failed to load. Using placeholder.
                    </p>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setActiveTab("content")}>
              Back to Content
            </Button>
            <Button type="button" onClick={() => setActiveTab("author")}>
              Next: Author & Publishing
            </Button>
          </div>
        </TabsContent>

        {/* Author & Publishing Tab */}
        <TabsContent value="author" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="author.name" className="text-base font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Author Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author.name"
                placeholder="Enter author name"
                className={`mt-1 ${errors.author?.name ? "border-red-500" : ""}`}
                {...register("author.name")}
              />
              {errors.author?.name && <p className="text-red-500 text-sm mt-1">{errors.author.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="author.avatar" className="text-base font-medium">
                Author Avatar URL
              </Label>
              <Input
                id="author.avatar"
                placeholder="https://example.com/avatar.jpg"
                className={`mt-1 ${errors.author?.avatar ? "border-red-500" : ""}`}
                {...register("author.avatar")}
              />
              {errors.author?.avatar && <p className="text-red-500 text-sm mt-1">{errors.author.avatar.message}</p>}
            </div>

            <div>
              <Label htmlFor="author.bio" className="text-base font-medium">
                Author Bio
              </Label>
              <Textarea
                id="author.bio"
                placeholder="Enter author bio"
                className="mt-1 min-h-[100px]"
                {...register("author.bio")}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="published" className="text-base font-medium">
                    Publish Blog Post
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, this blog post will be visible to all users.
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={watch("published")}
                  onCheckedChange={(checked) => setValue("published", checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setActiveTab("media")}>
              Back to Media & Metadata
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : initialData ? (
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Update
                </div>
              ) : (
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Create
                </div>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}
