import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-hero-gradient dark:bg-none py-12 md:py-20 overflow-hidden">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center rounded-full bg-white/80 dark:bg-gray-800/80 px-3 py-1 text-sm shadow-sm backdrop-blur-sm">
              <span className="text-pink-500 font-medium">Welcome to Tripwiser</span>
              <span className="ml-1">✨</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="block">We Handle the</span>
              <span className="block">Details,</span>
              <span className="block text-pink-500">You Enjoy the Trip.</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
              Experience hassle-free travel planning with our intuitive platform. Discover destinations, find the best
              deals, and create unforgettable memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[500px]">
            {/* Floating images */}
            <div className="absolute top-0 right-0 animate-float-slow">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Beach destination"
                width={200}
                height={150}
                className="rounded-lg shadow-lg floating-image"
              />
            </div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 animate-float-medium">
              <Image
                src="/placeholder.svg?height=180&width=240"
                alt="Mountain destination"
                width={240}
                height={180}
                className="rounded-lg shadow-lg floating-image"
              />
            </div>
            <div className="absolute bottom-0 right-1/4 animate-float-fast">
              <Image
                src="/placeholder.svg?height=160&width=220"
                alt="City destination"
                width={220}
                height={160}
                className="rounded-lg shadow-lg floating-image"
              />
            </div>
            <div className="absolute top-1/4 right-1/3 animate-float-medium">
              <Image
                src="/placeholder.svg?height=140&width=190"
                alt="Historical destination"
                width={190}
                height={140}
                className="rounded-lg shadow-lg floating-image"
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-1/4 left-1/4 h-8 w-8 rounded-full bg-yellow-300 animate-float-slow opacity-80"></div>
            <div className="absolute bottom-1/3 right-0 h-6 w-6 rounded-full bg-pink-300 animate-float-medium opacity-80"></div>
            <div className="absolute bottom-1/4 left-1/3 h-4 w-4 rounded-full bg-blue-300 animate-float-fast opacity-80"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
