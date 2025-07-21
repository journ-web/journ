"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { LogOut, Trash2, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AccountInfo } from "@/components/dashboard/settings/account-info"
import { AppearanceSettings } from "@/components/dashboard/settings/appearance-settings"
import { ClearDataModal } from "@/components/dashboard/settings/clear-data-modal"
import Link from "next/link"

export default function SettingsPage() {
  const { signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await signOut() // AuthContext's signOut already handles navigation
      // Removed: router.push("/login")
    } catch (err) {
      console.error("Error signing out:", err)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Account Info Section */}
      <AccountInfo />

      {/* Appearance Section */}
      <AppearanceSettings />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Get help with using Tripwiser</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Need help with Tripwiser? Our support team is ready to assist you with any questions or issues you may have.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/support" className="flex items-center">
              <LifeBuoy className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Account Deletion Section */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your data</CardDescription>
        </CardHeader>
        <CardContent>
          <ClearDataModal
            trigger={
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Logout Section */}
      <div className="pt-4 pb-8">
        <Button variant="outline" className="w-full sm:w-auto bg-transparent" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  )
}
