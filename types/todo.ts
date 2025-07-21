export type TaskCategory = "Personal" | "Work" | "Travel" | "Urgent"
export type TaskPriority = "None" | "Low" | "Medium" | "High"
export type TaskStatus = "Pending" | "In Progress" | "Completed"

export interface TodoTask {
  id: string
  title: string
  description?: string
  dueDate: string // ISO string format
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  createdAt: string // ISO string format
  updatedAt?: string // ISO string format
}
