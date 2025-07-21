"use client"
import { format, parse } from "date-fns"
import type { TodoTask } from "@/types/todo"
import { TaskCard } from "@/components/dashboard/todo/task-card"
import { EmptyState } from "@/components/dashboard/empty-state"

interface TodoListProps {
  tasks: TodoTask[]
  onEdit: (task: TodoTask) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string) => void
  groupByMonthYear?: boolean
}

export function TodoList({ tasks, onEdit, onDelete, onToggleStatus, groupByMonthYear = false }: TodoListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        type="tasks"
        title="No tasks found"
        description="No tasks match your current filters. Try adjusting your search or filter criteria."
      />
    )
  }

  if (!groupByMonthYear) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
        ))}
      </div>
    )
  }

  // Group tasks by month and year
  const groupedTasks: Record<string, TodoTask[]> = {}

  tasks.forEach((task) => {
    const date = new Date(task.dueDate)
    const monthYear = format(date, "MMMM yyyy")

    if (!groupedTasks[monthYear]) {
      groupedTasks[monthYear] = []
    }

    groupedTasks[monthYear].push(task)
  })

  // Sort the groups by date (earliest first)
  const sortedGroups = Object.entries(groupedTasks).sort(([a], [b]) => {
    const dateA = parse(a, "MMMM yyyy", new Date())
    const dateB = parse(b, "MMMM yyyy", new Date())
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="space-y-8">
      {sortedGroups.map(([monthYear, groupTasks]) => (
        <div key={monthYear} className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-border pb-2">{monthYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
