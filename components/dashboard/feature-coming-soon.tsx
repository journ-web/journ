"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureComingSoonProps {
  title?: string
  subtitle?: string
  emoji?: string
  returnPath?: string
  returnLabel?: string
}

export function FeatureComingSoon({
  title = "This feature is being built with you in mind, traveler.",
  subtitle = "We're working on something magical to help you save and relive your travel memories.",
  emoji = "🧳",
  returnPath = "/dashboard",
  returnLabel = "Return to Dashboard",
}: FeatureComingSoonProps) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md px-4"
      >
        <Card className="border shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="text-4xl mb-4">{emoji}</div>
            <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>{subtitle}</p>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6">
            <Button onClick={() => router.push(returnPath)} className="px-8">
              {returnLabel}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
