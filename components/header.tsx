"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useTheme } from "next-themes"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`w-full py-6 px-6 md:px-12 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-[#222]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={theme === "dark" ? "/images/journve-dark.png" : "/images/jvlogo.png"}
            alt="Journve Logo"
            width={40}
            height={40}
            className="flex-shrink-0"
          />
          <span className="text-xl tracking-tight" style={{ fontFamily: "Stolzl Medium, sans-serif", fontWeight: 600 }}>
            Journve
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-12">
          <Link
            href="/"
            className={`text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors ${
              pathname === "/" ? "text-blue-600" : "text-black dark:text-white/80"
            }`}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors ${
              pathname === "/about" ? "text-blue-600" : "text-black dark:text-white/80"
            }`}
          >
            About
          </Link>
          <Link
            href="/blog"
            className={`text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors ${
              pathname === "/blog" || pathname.startsWith("/blog/") ? "text-blue-600" : "text-black dark:text-white/80"
            }`}
          >
            Blogs
          </Link>
          <Link
            href="/support"
            className={`text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors ${
              pathname === "/support" ? "text-blue-600" : "text-black dark:text-white/80"
            }`}
          >
            Support
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {user && <NotificationDropdown />}
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-6 text-black dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222]"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="rounded-full px-6 border-gray-200 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#222] text-black dark:text-white"
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-6 text-black dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222]"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0 text-white"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          {user && <NotificationDropdown isMobile />}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="text-black dark:text-white"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-x-0 top-[72px] z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-[#222]"
          >
            <nav className="flex flex-col gap-1 p-6">
              <Link
                href="/"
                className="text-lg font-medium p-3 hover:bg-gray-100 dark:hover:bg-[#111] rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium p-3 hover:bg-gray-100 dark:hover:bg-[#111] rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-lg font-medium p-3 hover:bg-gray-100 dark:hover:bg-[#111] rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Blogs
              </Link>
              <Link
                href="/support"
                className="text-lg font-medium p-3 hover:bg-gray-100 dark:hover:bg-[#111] rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-gray-200 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#222] text-black dark:text-white bg-transparent"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-gray-200 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#222] text-black dark:text-white bg-transparent"
                      onClick={() => {
                        signOut()
                        setIsMenuOpen(false)
                      }}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-gray-200 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#222] text-black dark:text-white bg-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
