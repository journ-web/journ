"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format, parseISO } from "date-fns"
import {
  Bell,
  AlertTriangle,
  Check,
  X,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle,
  Clock,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types
interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "critical" | "success"
  category: "budget" | "task" | "currency" | "system"
  timestamp: string
  read: boolean
  actionable: boolean
  actionText?: string
  actionLink?: string
  tripId?: string
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Budget Alert",
    message: "You've used 80% of your budget for 'Backpacking Trip'",
    type: "warning",
    category: "budget",
    timestamp: format(new Date(new Date().setHours(new Date().getHours() - 2)), "yyyy-MM-dd'T'HH:mm:ss"),
    read: false,
    actionable: true,
    actionText: "Adjust Budget",
    actionLink: "/dashboard/trips",
    tripId: "trip-4",
  },
  {
    id: "notif-2",
    title: "Wallet Funds Alert",
    message: "Your budget has been depleted. Expenses are now being deducted from your wallet funds.",
    type: "critical",
    category: "budget",
    timestamp: format(new Date(new Date().setHours(new Date().getHours() - 5)), "yyyy-MM-dd'T'HH:mm:ss"),
    read: true,
    actionable: true,
    actionText: "Add Funds",
    actionLink: "/dashboard/trips",
    tripId: "trip-4",
  },
  {
    id: "notif-3",
    title: "Upcoming Task",
    message: "You have a temple tour scheduled for tomorrow at 10:00 AM",
    type: "info",
    category: "task",
    timestamp: format(new Date(new Date().setHours(new Date().getHours() - 12)), "yyyy-MM-dd'T'HH:mm:ss"),
    read: false,
    actionable: true,
    actionText: "View Details",
    actionLink: "/dashboard/trips",
    tripId: "trip-4",
  },
  {
    id: "notif-4",
    title: "Currency Rate Change",
    message: "USD to THB exchange rate has increased by 2.5% since yesterday",
    type: "info",
    category: "currency",
    timestamp: format(new Date(new Date().setHours(new Date().getHours() - 24)), "yyyy-MM-dd'T'HH:mm:ss"),
    read: true,
    actionable: true,
    actionText: "View Rates",
    actionLink: "/dashboard/currency",
  },
  {
    id: "notif-5",
    title: "Trip Started",
    message: "Your 'Backpacking Trip' has officially started today",
    type: "success",
    category: "system",
    timestamp: format(new Date(new Date().setHours(new Date().getHours() - 36)), "yyyy-MM-dd'T'HH:mm:ss"),
    read: true,
    actionable: false,
    tripId: "trip-4",
  },
  {
    id: "notif-6",
    title: "Safety Funds Alert",
    message: "Your budget and wallet funds have been depleted. Expenses are now being deducted from your safety funds.",
    type: "critical",
    category: "budget",
    timestamp: format(new Date(new Date().setHours(new Date().getHours() - 48)), "yyyy-MM-dd'T'HH:mm:ss"),
    read: true,
    actionable: true,
    actionText: "Add Funds",
    actionLink: "/dashboard/trips",
    tripId: "trip-3",
  },
]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Filter notifications based on active tab, search query, and category filter
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by read/unread status
    if (activeTab === "unread" && notification.read) {
      return false
    }

    // Filter by category
    if (categoryFilter && notification.category !== categoryFilter) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return notification.title.toLowerCase().includes(query) || notification.message.toLowerCase().includes(query)
    }

    return true
  })

  // Get notification icon based on type and category
  const getNotificationIcon = (notification: Notification) => {
    switch (notification.category) {
      case "budget":
        return notification.type === "critical" ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : notification.type === "warning" ? (
          <Wallet className="h-5 w-5 text-amber-500" />
        ) : (
          <DollarSign className="h-5 w-5 text-green-500" />
        )
      case "task":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "currency":
        return notification.message.includes("increased") ? (
          <TrendingUp className="h-5 w-5 text-green-500" />
        ) : (
          <TrendingDown className="h-5 w-5 text-red-500" />
        )
      case "system":
        return notification.type === "success" ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Info className="h-5 w-5 text-blue-500" />
        )
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Get notification background color based on type
  const getNotificationBgColor = (notification: Notification) => {
    if (notification.read) return ""

    switch (notification.type) {
      case "critical":
        return "bg-red-50 dark:bg-red-900/10"
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/10"
      case "success":
        return "bg-green-50 dark:bg-green-900/10"
      case "info":
        return "bg-blue-50 dark:bg-blue-900/10"
      default:
        return ""
    }
  }

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    }
  }

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "budget":
        return "Budget"
      case "task":
        return "Task"
      case "currency":
        return "Currency"
      case "system":
        return "System"
      default:
        return category
    }
  }

  // Get category badge color
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "budget":
        return "bg-pink-500 text-white"
      case "task":
        return "bg-blue-500 text-white"
      case "currency":
        return "bg-green-500 text-white"
      case "system":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts and reminders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
          <Button variant="outline" onClick={clearAllNotifications}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <CardTitle>Notifications</CardTitle>
              <Badge>{notifications.filter((notification) => !notification.read).length}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  className="w-full md:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notifications found</p>
                  {(searchQuery || categoryFilter) && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("")
                        setCategoryFilter(null)
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${getNotificationBgColor(notification)}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              </div>
                              <Badge className={getCategoryBadgeColor(notification.category)}>
                                {getCategoryLabel(notification.category)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {notification.actionable && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={notification.actionLink}>{notification.actionText}</a>
                                  </Button>
                                )}
                                {!notification.read && (
                                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                    Mark as Read
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
