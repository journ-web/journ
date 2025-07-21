export interface BlogAuthor {
  name: string
  avatar: string
  bio: string
}

export interface Blog {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  date: string
  readTime: string
  author: BlogAuthor
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface BlogFormData {
  title: string
  excerpt: string
  content: string
  image: string
  date: string
  readTime: string
  author: BlogAuthor
  category: string
  tags: string[]
  published: boolean
}
