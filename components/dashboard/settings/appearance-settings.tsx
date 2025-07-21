"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Heart } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how TripWiser looks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Theme</Label>
          <Tabs defaultValue="light" onValueChange={setTheme} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-md">
              <TabsTrigger value="light" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Light</span>
              </TabsTrigger>
              <TabsTrigger value="dark" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Dark</span>
              </TabsTrigger>
              <TabsTrigger value="light-pink" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span className="hidden sm:inline">Light Pink</span>
              </TabsTrigger>
              <TabsTrigger value="dark-pink" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span className="hidden sm:inline">Dark Pink</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
