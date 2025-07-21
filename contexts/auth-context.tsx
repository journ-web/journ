"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  showPreloader: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreloader, setShowPreloader] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
      setShowPreloader(true)

      // Show preloader for 3 seconds before redirecting
      setTimeout(() => {
        router.push("/dashboard")
        setTimeout(() => {
          setShowPreloader(false)
        }, 500) // Give a little time for navigation to complete
      }, 3000)
    } catch (error: any) {
      setError(error.message)
      console.error("Login error:", error.message)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      await createUserWithEmailAndPassword(auth, email, password)
      setShowPreloader(true)

      // Show preloader for 3 seconds before redirecting
      setTimeout(() => {
        router.push("/dashboard")
        setTimeout(() => {
          setShowPreloader(false)
        }, 500) // Give a little time for navigation to complete
      }, 3000)
    } catch (error: any) {
      setError(error.message)
      console.error("Signup error:", error.message)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      setShowPreloader(true)

      // Show preloader for 3 seconds before redirecting
      setTimeout(() => {
        router.push("/dashboard")
        setTimeout(() => {
          setShowPreloader(false)
        }, 500) // Give a little time for navigation to complete
      }, 3000)
    } catch (error: any) {
      setError(error.message)
      console.error("Google sign-in error:", error.message)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/login")
    } catch (error: any) {
      setError(error.message)
      console.error("Logout error:", error.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        showPreloader,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
