"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AuthErrorProps {
  message: string
  onClose?: () => void
}

export function AuthError({ message, onClose }: AuthErrorProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="text-sm">{message}</div>
        {message.includes("unauthorized-domain") && (
          <div className="mt-2 text-xs">
            <p className="font-semibold">How to fix:</p>
            <ol className="list-decimal pl-4 mt-1 space-y-1">
              <li>Go to the Firebase Console</li>
              <li>Select your project &quot;trip-wiser&quot;</li>
              <li>Go to Authentication &gt; Settings &gt; Authorized domains</li>
              <li>Add your current domain to the list</li>
              <li>For local development, make sure &quot;localhost&quot; is in the list</li>
            </ol>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="mt-2 text-xs underline hover:no-underline">
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  )
}
