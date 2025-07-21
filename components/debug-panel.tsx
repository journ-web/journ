"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTrips } from "@/hooks/use-trips"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Bug, ChevronDown, RefreshCw } from "lucide-react"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading: authLoading, error: authError } = useAuth()
  const { trips, loading: tripsLoading, error: tripsError, initialized: tripsInitialized } = useTrips()
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    initialized: notificationsInitialized,
  } = useNotifications()

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader className="p-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Bug className="h-4 w-4 mr-2 text-amber-500" />
            Debug Panel
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </CardTitle>
      </CardHeader>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="p-3 pt-0 text-xs">
            <div className="space-y-2">
              <div>
                <div className="font-medium">Auth Status:</div>
                <div className="text-muted-foreground">
                  {authLoading ? "Loading..." : user ? `Logged in as ${user.email}` : "Not logged in"}
                </div>
                {authError && <div className="text-red-500">{authError}</div>}
              </div>

              <div>
                <div className="font-medium">Trips:</div>
                <div className="text-muted-foreground">
                  {tripsLoading ? "Loading..." : tripsInitialized ? `${trips.length} trips loaded` : "Not initialized"}
                </div>
                {tripsError && <div className="text-red-500">{tripsError}</div>}
                <div className="mt-1">
                  <div>Ongoing: {trips?.filter((t) => t.status === "ongoing").length || 0}</div>
                  <div>Planned: {trips?.filter((t) => t.status === "planned").length || 0}</div>
                  <div>
                    Completed: {trips?.filter((t) => t.status === "completed" || t.status === "cancelled").length || 0}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-medium">Notifications:</div>
                <div className="text-muted-foreground">
                  {notificationsLoading
                    ? "Loading..."
                    : notificationsInitialized
                      ? `${notifications.length} notifications loaded`
                      : "Not initialized"}
                </div>
                {notificationsError && <div className="text-red-500">{notificationsError}</div>}
              </div>

              <Button size="sm" className="w-full mt-2" onClick={() => window.location.reload()}>
                <RefreshCw className="h-3 w-3 mr-2" />
                Reload Page
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
