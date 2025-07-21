"use client"

import { Bell, Plane, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  type: "trips" | "expenses" | "tasks" | "notifications"
  title?: string
  description?: string
}

export function EmptyState({ type, title, description }: EmptyStateProps) {
  const renderContent = () => {
    switch (type) {
      case "trips":
        return {
          icon: <Plane className="h-12 w-12 text-muted-foreground" />,
          title: title || "No trips found",
          description: description || "You haven't created any trips yet. Start planning your next adventure!",
          action: (
            <Button asChild>
              <Link href="/dashboard/trips/planned">Create Trip</Link>
            </Button>
          ),
        }
      case "expenses":
        return {
          icon: <DollarSign className="h-12 w-12 text-muted-foreground" />,
          title: title || "No expenses found",
          description: description || "You haven't added any expenses yet. Start tracking your spending!",
          action: null,
        }
      case "tasks":
        return {
          icon: <Calendar className="h-12 w-12 text-muted-foreground" />,
          title: title || "No tasks found",
          description: description || "You haven't added any tasks yet. Start planning your activities!",
          action: null,
        }
      case "notifications":
        return {
          icon: <Bell className="h-12 w-12 text-muted-foreground" />,
          title: title || "No notifications",
          description: description || "You don't have any notifications at the moment.",
          action: null,
        }
      default:
        return {
          icon: <Bell className="h-12 w-12 text-muted-foreground" />,
          title: "No data found",
          description: "There's nothing to display here yet.",
          action: null,
        }
    }
  }

  const content = renderContent()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted/30 p-4 rounded-full mb-4">{content.icon}</div>
      <h3 className="text-lg font-medium mb-2">{content.title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{content.description}</p>
      {content.action}
    </div>
  )
}
