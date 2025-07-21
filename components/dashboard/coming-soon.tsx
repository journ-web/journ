"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

interface ComingSoonProps {
  title: string
  description: string
  type: "coming-soon" | "under-construction"
}

export function ComingSoon({ title, description, type }: ComingSoonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="max-w-md mx-auto">
        <Image
          src={
            type === "coming-soon"
              ? "/placeholder.svg?height=300&width=300&text=Coming+Soon"
              : "/placeholder.svg?height=300&width=300&text=Under+Construction"
          }
          alt={type === "coming-soon" ? "Coming Soon" : "Under Construction"}
          width={300}
          height={300}
          className="mx-auto mb-8 w-full max-w-[200px] md:max-w-[300px]"
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </motion.div>
  )
}
