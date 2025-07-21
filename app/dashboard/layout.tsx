"use client"

import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DebugPanel } from "@/components/debug-panel"
// Removed: import { useEffect } from "react"
// Removed: import { DashboardRedirect } from "@/components/dashboard/dashboard-redirect" // Assuming this was a separate component or part of this file

export default function Layout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <DashboardLayout>
      {/* Removed DashboardRedirect component */}
      {children}
      {process.env.NODE_ENV !== "production" && <DebugPanel />}
    </DashboardLayout>
  )
}
