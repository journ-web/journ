import type { Metadata } from "next"
import { generateStructuredData } from "@/lib/seo" // Import generateStructuredData

// SEO Meta Tags for Spanish Page (/es)
export const metadata: Metadata = {
  title: "Journve: Tu Compañero de Viaje Inteligente",
  description:
    "Sin caos. Sin anuncios. Planea, registra y viaja sin conexión con Journve. La forma más simple y privada de viajar.",
  keywords: [
    "compañero de viaje",
    "viajes sin conexión",
    "app de viajes inteligente",
    "diario de viaje",
    "gastos de viaje",
    "sin anuncios",
    "Journve",
  ],
  openGraph: {
    title: "Journve: Tu Compañero de Viaje Inteligente",
    description:
      "Sin caos. Sin anuncios. Planea, registra y viaja sin conexión con Journve. La forma más simple y privada de viajar.",
    url: "https://journve.com", // Corrected URL
    siteName: "Journve",
    locale: "es_ES", // Explicitly set locale
    // You can add an image here if you have one for social sharing, e.g.:
    // images: ['https://journve.com/og-image-es.jpg'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Journve: Tu Compañero de Viaje Inteligente",
    description:
      "Sin caos. Sin anuncios. Planea, registra y viaja sin conexión con Journve. La forma más simple y privada de viajar.",
    // You can add an image here if you have one for social sharing, e.g.:
    // images: ['https://journve.com/twitter-image-es.jpg'],
  },
  alternates: {
    canonical: "https://journve.com/es", // Corrected URL
    languages: {
      es: "https://journve.com/es", // Corrected URL
      en: "https://journve.com", // Corrected URL
      "x-default": "https://journve.com", // Add x-default
    },
  },
  other: {
    language: "es", // Explicitly set language meta tag
  },
}

export default function SpanishHomePage() {
  // JSON-LD Structured Data
  const jsonLd = generateStructuredData("software", {
    name: "Journve",
    description:
      "Journve es tu compañero de viaje inteligente. Planifica, registra gastos, escribe tu diario y accede sin conexión. Sin caos, sin anuncios.",
    url: "https://journve.com/es",
    inLanguage: "es",
    aggregateRating: {
      ratingValue: "4.8",
      reviewCount: "1250",
    },
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-center mb-4">¡Bienvenido a Journve!</h1>
      <p className="text-lg text-center max-w-2xl">
        Tu compañero inteligente para viajes sin caos. Planifica, anota, controla. Sin conexión.
      </p>
      {/* JSON-LD script tag */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}
