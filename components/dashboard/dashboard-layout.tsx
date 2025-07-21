"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Settings,
  Menu,
  Globe,
  BarChart3,
  LogOut,
  CheckSquare,
  CalendarClock,
  CheckCircle,
  Book,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { UserProfileDropdown } from "@/components/dashboard/user-profile-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  current: boolean
}

// Navigation items component with collapse support
function NavigationItems({
  items,
  collapsed,
  mobile = false,
}: {
  items: NavigationItem[]
  collapsed: boolean
  mobile?: boolean
}) {
  if (mobile) {
    // Mobile navigation is always expanded
    return (
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              item.current
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </div>
    )
  }

  // Desktop navigation with collapse support
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <TooltipProvider key={item.name} delayDuration={collapsed ? 100 : 1000}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md text-sm font-medium transition-all",
                  collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                  item.current
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "mr-0" : "mr-3")} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" align="start">
                {item.name}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { theme } = useTheme()

  // Store sidebar state in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("sidebarCollapsed")
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true")
      }
    }
  }, [])

  // Update localStorage when sidebar state changes
  useEffect(() => {
    if (typeof window !== "undefined" && isMounted) {
      localStorage.setItem("sidebarCollapsed", String(collapsed))
    }
  }, [collapsed, isMounted])

  // Hydration fix
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    // Force layout recalculation
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"))
    }, 300)
  }

  // Navigation items
  const navigation = [
    {
      name: "Current Trip",
      href: "/dashboard/trips",
      icon: MapPin,
      current:
        pathname === "/dashboard/trips" ||
        (pathname?.startsWith("/dashboard/trips/") &&
          !pathname.includes("/planned") &&
          !pathname.includes("/completed")),
    },
    {
      name: "Plan a Trip",
      href: "/dashboard/trips/planned",
      icon: CalendarClock,
      current: pathname === "/dashboard/trips/planned" || pathname?.startsWith("/dashboard/trips/planned?"),
    },
    {
      name: "Completed Trips",
      href: "/dashboard/trips/completed",
      icon: CheckCircle,
      current: pathname === "/dashboard/trips/completed" || pathname?.startsWith("/dashboard/trips/completed?"),
    },
    {
      name: "To-Do List",
      href: "/dashboard/todo",
      icon: CheckSquare,
      current: pathname === "/dashboard/todo",
    },
    {
      name: "My Journal",
      href: "/dashboard/journal",
      icon: Book,
      current: pathname === "/dashboard/journal" || pathname?.startsWith("/dashboard/journal/"),
    },
    {
      name: "Splitly",
      href: "/dashboard/splitly",
      icon: DollarSign,
      current: pathname === "/dashboard/splitly" || pathname?.startsWith("/dashboard/splitly/"),
    },
    {
      name: "Currency Converter",
      href: "/dashboard/currency",
      icon: Globe,
      current: pathname === "/dashboard/currency",
    },
    {
      name: "Insights",
      href: "/dashboard/insights",
      icon: BarChart3,
      current: pathname === "/dashboard/insights",
    },
  ]

  // Render desktop sidebar
  const renderDesktopSidebar = () => (
    <div
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r transition-all duration-300 ease-in-out z-20",
        collapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <div className="flex flex-col h-full">
        <div className={cn("px-3 py-4 overflow-y-auto")}>
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard/trips" className={cn("flex items-center px-2 py-3", collapsed && "justify-center")}>
              <div className={cn("flex items-center", collapsed && "justify-center")}>
                {collapsed ? (
                  <Image
                    src={theme === "dark" ? "/images/journve-dark.png" : "/images/jvlogo.png"}
                    alt="Journve Logo"
                    width={32}
                    height={32}
                    className="flex-shrink-0"
                  />
                ) : (
                  <>
                    <Image
                      src={theme === "dark" ? "/images/journve-dark.png" : "/images/jvlogo.png"}
                      alt="Journve Logo"
                      width={32}
                      height={32}
                      className="flex-shrink-0 mr-3"
                    />
                    <span className="text-xl" style={{ fontFamily: "Stolzl Medium, sans-serif", fontWeight: 600 }}>
                      Journve
                    </span>
                  </>
                )}
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="hidden md:flex hover:bg-muted"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <NavigationItems items={navigation} collapsed={collapsed} />
        </div>

        <div className="mt-auto px-3 py-4">
          <Separator className="mb-4" />
          {collapsed ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={signOut}>
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="absolute bottom-20 -right-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleCollapse}
                        className="h-8 w-8 rounded-full bg-background border shadow-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Expand sidebar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={signOut}>
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">Sign Out</span>
              </Button>
              <div className="absolute bottom-20 right-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCollapse}
                  className="h-8 w-8 rounded-full bg-background border shadow-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Render mobile sidebar
  const renderMobileSidebar = () => (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 max-w-[80vw]">
        <div className="flex flex-col h-full">
          <div className="px-3 py-4 overflow-y-auto">
            <Link href="/dashboard/trips" className="flex items-center px-2 py-3 mb-6">
              <div className="flex items-center">
                <Image
                  src={theme === "dark" ? "/images/journve-dark.png" : "/images/jvlogo.png"}
                  alt="Journve Logo"
                  width={32}
                  height={32}
                  className="flex-shrink-0 mr-3"
                />
                <span className="text-xl" style={{ fontFamily: "Stolzl Medium, sans-serif", fontWeight: 600 }}>
                  Journve
                </span>
              </div>
            </Link>

            <NavigationItems items={navigation} collapsed={false} mobile={true} />
          </div>

          <div className="mt-auto px-3 py-4">
            <Separator className="mb-4" />
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={signOut}>
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  // Show a loading skeleton during hydration
  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen bg-background overflow-hidden">
        <div className="flex flex-col flex-1 w-full">
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b h-16">
            <div className="flex items-center">
              <div className="ml-2">
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-muted rounded mt-1 animate-pulse"></div>
              </div>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      {renderDesktopSidebar()}

      {/* Main content */}
      <div
        className={cn(
          "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out",
          collapsed ? "md:pl-16" : "md:pl-64",
        )}
      >
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-sm border-b h-16">
          <div className="flex items-center">
            {renderMobileSidebar()}
            <div className="ml-2 overflow-hidden">
              <h2 className="font-medium text-lg truncate">Welcome traveller!</h2>
              <p className="text-xs text-muted-foreground truncate">Enjoy your journey with Journve</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <ThemeToggle />
            <UserProfileDropdown />
          </div>
        </div>

        {/* Page content */}
        <main className="overflow-y-auto p-4 md:p-6 w-full">{children}</main>
      </div>
    </div>
  )
}

// Named export for the component
