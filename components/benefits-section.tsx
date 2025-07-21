import Image from "next/image"
import { MapPin, Calendar, DollarSign } from "lucide-react"

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 overflow-hidden bg-gradient-to-b from-white to-amber-50/50 dark:from-gray-900 dark:to-gray-900">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h3 className="text-pink-500 font-medium uppercase tracking-wider mb-3">Services</h3>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why book using Tripwiser</h2>
              <p className="text-muted-foreground max-w-md">
                Hey! Tripwiser there to help you find your dream holiday. Save money, track expenses, and travel
                worry-free.
              </p>
            </div>

            <div className="space-y-8 mt-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Select many location</h3>
                  <p className="text-muted-foreground">Choose your favorite location</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Schedule your trip</h3>
                  <p className="text-muted-foreground">Set the date you want</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Save Money</h3>
                  <p className="text-muted-foreground">Save cash for every services</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] hidden lg:block">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="text-yellow-500 text-xs">
                    ✕
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="absolute top-0 right-0 w-[350px] h-[300px] rounded-2xl overflow-hidden shadow-lg">
              <Image src="/placeholder.svg?height=300&width=350" alt="Colosseum" fill className="object-cover" />
            </div>

            <div className="absolute bottom-0 right-20 w-[300px] h-[250px] rounded-2xl overflow-hidden shadow-lg">
              <Image src="/placeholder.svg?height=250&width=300" alt="Dubai" fill className="object-cover" />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32">
              <div className="relative w-full h-full">
                <div className="absolute top-0 left-0 w-full h-full border-t-4 border-r-4 border-orange-400 rounded-tr-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
