"use client"

import Link from "next/link"
import Image from "next/image"
import { Youtube, Twitter, Instagram } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Footer() {
  const { user } = useAuth()

  // Check if user is authorized to access blog management
  const isAuthorizedForBlogMan =
    user && (user.uid === "lp6h2Nf2u5QE0buxheG5HBdv9gL2" || user.uid === "wm4sGMxPlYh1ChK8CypasjX03s62")

  return (
    <footer className="bg-[#050505] border-t border-[#222]">
      <div className="max-w-[1800px] mx-auto py-20 px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/images/journve-dark.png" alt="Journve Logo" width={32} height={32} />
              <span className="font-bold text-xl tracking-tight text-white">JOURNVE</span>
            </Link>
            <p className="text-[#999] text-sm mb-6 max-w-xs">
              Your all-in-one travel companion for planning, tracking, and sharing unforgettable journeys.
            </p>
            <div className="flex gap-6">
              <Link
                href="https://www.youtube.com/@Journve"
                className="text-[#666] hover:text-blue-400 transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
              <Link href="https://x.com/journve" className="text-[#666] hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">X (Twitter)</span>
              </Link>
              <Link
                href="https://www.instagram.com/journve_official/"
                className="text-[#666] hover:text-blue-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div className="md:text-center">
            <h3 className="text-xs uppercase tracking-wider font-semibold mb-6 text-[#999]">Navigation</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Sign Up
                </Link>
              </li>
              {isAuthorizedForBlogMan && (
                <li>
                  <Link
                    href="/dashboard/blogman"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    Blog Management
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="md:text-right">
            <h3 className="text-xs uppercase tracking-wider font-semibold mb-6 text-[#999]">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/terms" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[#999] hover:text-blue-400 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#222] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-[#666]">&copy; {new Date().getFullYear()} Journve. All rights reserved.</p>
          <p className="text-xs text-[#666] mt-4 md:mt-0">Designed and built with care for travelers worldwide.</p>
        </div>
      </div>
    </footer>
  )
}
