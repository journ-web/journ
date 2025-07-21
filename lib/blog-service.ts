import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Blog, BlogFormData } from "@/types/blog"

const BLOGS_COLLECTION = "blogs"

// Get published blogs (public access)
export const getPublishedBlogs = async () => {
  try {
    console.log("Fetching published blogs from Firestore...")
    const blogsRef = collection(db, BLOGS_COLLECTION)

    // Query for all published blogs, ordered by creation date descending
    const q = query(blogsRef, where("published", "==", true), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    console.log(`Found ${querySnapshot.size} published blogs`)

    const blogs: Blog[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      blogs.push({
        id: doc.id,
        title: data.title || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        image: data.image || "/placeholder.svg?height=400&width=600",
        date: data.date || new Date().toISOString(),
        readTime: data.readTime || "5 min read",
        author: {
          name: data.author?.name || "Anonymous",
          avatar: data.author?.avatar || "",
          bio: data.author?.bio || "",
        },
        category: data.category || "Uncategorized",
        tags: data.tags || [],
        published: data.published || false,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      })
    })

    return { success: true, data: blogs }
  } catch (error) {
    console.error("Error getting published blogs:", error)
    return { success: false, error: "Failed to fetch published blogs", data: [] }
  }
}

// Get all blogs (admin access)
export const getAllBlogs = async () => {
  try {
    console.log("Fetching all blogs from Firestore...")
    const blogsRef = collection(db, BLOGS_COLLECTION)
    const q = query(blogsRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    console.log(`Found ${querySnapshot.size} blogs in total`)

    const blogs: Blog[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      blogs.push({
        id: doc.id,
        title: data.title || "",
        excerpt: data.excerpt || "",
        content: data.content || "",
        image: data.image || "/placeholder.svg?height=400&width=600",
        date: data.date || new Date().toISOString(),
        readTime: data.readTime || "5 min read",
        author: {
          name: data.author?.name || "Anonymous",
          avatar: data.author?.avatar || "",
          bio: data.author?.bio || "",
        },
        category: data.category || "Uncategorized",
        tags: data.tags || [],
        published: data.published || false,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      })
    })

    return { success: true, data: blogs }
  } catch (error) {
    console.error("Error getting all blogs:", error)
    return { success: false, error: "Failed to fetch blogs", data: [] }
  }
}

// Get a single blog by ID
export const getBlogById = async (blogId: string) => {
  try {
    console.log(`Fetching blog with ID: ${blogId}`)
    const blogRef = doc(db, BLOGS_COLLECTION, blogId)
    const blogSnap = await getDoc(blogRef)

    if (blogSnap.exists()) {
      const data = blogSnap.data()
      console.log(`Blog found:`, data)

      return {
        success: true,
        data: {
          id: blogSnap.id,
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          image: data.image || "/placeholder.svg?height=400&width=600",
          date: data.date || new Date().toISOString(),
          readTime: data.readTime || "5 min read",
          author: {
            name: data.author?.name || "Anonymous",
            avatar: data.author?.avatar || "",
            bio: data.author?.bio || "",
          },
          category: data.category || "Uncategorized",
          tags: data.tags || [],
          published: data.published || false,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        } as Blog,
      }
    } else {
      console.log(`Blog with ID ${blogId} not found`)
      return { success: false, error: "Blog not found" }
    }
  } catch (error) {
    console.error("Error getting blog:", error)
    return { success: false, error: "Failed to fetch blog" }
  }
}

// Create a new blog
export const createBlog = async (blogData: BlogFormData) => {
  try {
    const blogsRef = collection(db, BLOGS_COLLECTION)

    // Ensure we have all required fields with defaults
    const formattedData = {
      title: blogData.title || "",
      excerpt: blogData.excerpt || "",
      content: blogData.content || "",
      image: blogData.image || "/placeholder.svg?height=400&width=600",
      date: blogData.date || new Date().toISOString(),
      readTime: blogData.readTime || "5 min read",
      author: blogData.author || {
        name: "Anonymous",
        avatar: "",
        bio: "",
      },
      category: blogData.category || "Uncategorized",
      tags: blogData.tags || [],
      published: blogData.published || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    console.log("Creating new blog with data:", formattedData)
    const docRef = await addDoc(blogsRef, formattedData)
    console.log(`Blog created with ID: ${docRef.id}`)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating blog:", error)
    return { success: false, error: "Failed to create blog" }
  }
}

// Update an existing blog
export const updateBlog = async (blogId: string, blogData: Partial<BlogFormData>) => {
  try {
    console.log(`Updating blog with ID: ${blogId}`, blogData)
    const blogRef = doc(db, BLOGS_COLLECTION, blogId)

    // Update the document with the new data
    await updateDoc(blogRef, {
      ...blogData,
      updatedAt: serverTimestamp(),
    })

    console.log(`Blog ${blogId} updated successfully`)
    return { success: true }
  } catch (error) {
    console.error("Error updating blog:", error)
    return { success: false, error: "Failed to update blog" }
  }
}

// Delete a blog
export const deleteBlog = async (blogId: string) => {
  try {
    console.log(`Deleting blog with ID: ${blogId}`)
    const blogRef = doc(db, BLOGS_COLLECTION, blogId)
    await deleteDoc(blogRef)
    console.log(`Blog ${blogId} deleted successfully`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting blog:", error)
    return { success: false, error: "Failed to delete blog" }
  }
}
