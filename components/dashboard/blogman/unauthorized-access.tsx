"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function UnauthorizedAccess() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mb-6" />
      <h1 className="text-2xl font-bold mb-2">Unauthorized Access</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        You do not have permission to access the blog management dashboard. This area is restricted to authorized
        administrators only.
      </p>
      <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
    </div>
  )
}
