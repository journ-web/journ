"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AccountInfo() {
  const { user, refreshUserData, userDisplayName } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [originalName, setOriginalName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Use userDisplayName from auth context if available, otherwise fallback to user.displayName
      const displayName = userDisplayName || user.displayName || ""
      setName(displayName)
      setOriginalName(displayName)
    }
  }, [user, userDisplayName])

  const handleUpdateName = async () => {
    if (!user) return

    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { name })

      setOriginalName(name)
      setSuccess("Name updated successfully")

      // Refresh user data in the auth context
      await refreshUserData()

      toast({
        title: "Success",
        description: "Your name has been updated.",
        variant: "default",
      })
    } catch (err) {
      console.error("Error updating name:", err)
      setError("Something went wrong. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update your name.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Manage your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email || ""} disabled className="bg-muted cursor-not-allowed" />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        {success && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {name !== originalName && (
          <Button onClick={handleUpdateName} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
