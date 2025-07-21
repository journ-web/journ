"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Capture additional error information
    this.setState({ errorInfo })

    // Log the error to console for debugging
    console.error("Dashboard error caught by boundary:", error)
    console.error("Component stack:", errorInfo.componentStack)
  }

  // Reset the error state to allow recovery
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI or the provided fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
            <h2 className="font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm">We encountered an error while loading this page.</p>
            <p className="text-xs mt-2 text-muted-foreground">{this.state.error?.message || "Unknown error"}</p>
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer">Technical details</summary>
                <pre className="mt-2 p-2 bg-muted/50 rounded overflow-auto max-h-[200px]">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={this.handleReset} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
