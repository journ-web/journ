"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { AuthError } from "@/components/auth-error"
import { motion } from "framer-motion"
import { AuthImageCarousel } from "@/components/auth-image-carousel"

export default function SignupPage() {
  const { signInWithGoogle, error, clearError, loading } = useAuth()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => {
        setShowError(false)
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return (
    <main className="min-h-screen pt-20">
      <Header />

      <section className="py-24 md:py-32">
        <div className="container px-6 md:px-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto md:mx-0 w-full md:order-2"
            >
              <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Create an Account</h1>
                <p className="text-muted-foreground">Sign up to get started with Tripwiser</p>
              </div>

              {error && <AuthError message={error} onClose={clearError} />}

              <div className="space-y-6">
                <Button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-6"
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545 10.239v3.821h5.445c-0.643 2.783-2.835 4.76-5.445 4.76-3.312 0-6-2.688-6-6s2.688-6 6-6c1.757 0 3.332 0.764 4.441 1.979l2.862-2.862c-2.099-1.789-4.809-2.763-7.603-2.763-5.523 0-10 4.477-10 10s4.477 10 10 10c8.396 0 10-7.584 10-11.398 0-0.601-0.042-1.142-0.13-1.638h-9.87z"
                    />
                  </svg>
                  {loading ? "Signing up..." : "Sign up with Google"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                      Log in
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-[400px] md:h-[600px] rounded-2xl overflow-hidden hidden md:block md:order-1"
            >
              <AuthImageCarousel />
              <div className="absolute bottom-0 left-0 p-8 text-white z-10">
                <h2 className="text-3xl font-bold mb-2">Join Journve Today</h2>
                <p className="text-white/80">Create an account and start planning your dream trips with Journve.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
