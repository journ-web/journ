import Image from "next/image"

export function PartnersSection() {
  const partners = [
    { name: "Hotels.com", logo: "/placeholder.svg?height=30&width=120" },
    { name: "Booking.com", logo: "/placeholder.svg?height=30&width=120" },
    { name: "TripAdvisor", logo: "/placeholder.svg?height=30&width=120" },
    { name: "Airbnb", logo: "/placeholder.svg?height=30&width=120" },
  ]

  return (
    <section className="py-10 border-t border-b border-gray-100 dark:border-gray-800">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {partners.map((partner) => (
            <div key={partner.name} className="opacity-70 hover:opacity-100 transition-opacity">
              <Image
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                width={120}
                height={30}
                className="h-8 w-auto object-contain dark:invert"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
