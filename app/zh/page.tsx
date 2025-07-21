import type { Metadata } from "next"
import { generateStructuredData } from "@/lib/seo" // Import generateStructuredData

// ASO details are for app store listings, not directly in the web page code.
// App Title: Journve：智能旅行助手
// Apple Short Description: 无混乱，无广告，纯旅行体验
// Google Play Short Description: Journve 是您的智能旅行伴侣。离线使用，记录行程与花费，无广告。

export const metadata: Metadata = {
  title: "Journve：您的智能旅行伴侣",
  description: "无广告，无混乱。Journve 帮您轻松规划行程、记录支出、书写旅行日记，完全离线使用。",
  keywords: "智能旅行助手, 旅行计划, 离线旅行App, 旅行日记, 旅行花费记录, 无广告App, Journve",
  openGraph: {
    title: "Journve：您的智能旅行伴侣",
    description: "智能旅行记录与支出管理，完全离线。无广告，无追踪。",
    url: "https://journve.com", // Corrected URL
    siteName: "Journve",
    locale: "zh_CN", // Explicitly set locale
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journve 智能旅行助手",
    description: "离线使用，纯净旅行体验。",
  },
  alternates: {
    canonical: "https://journve.com", // Corrected URL
    languages: {
      "zh-CN": "https://journve.com", // Corrected URL
      en: "https://journve.com", // Corrected URL
      es: "https://journve.com", // Corrected URL
      "x-default": "https://journve.com", // Add x-default
    },
  },
  other: {
    language: "zh-CN", // Explicitly set language meta tag
  },
}

export default function ChinesePage() {
  const jsonLd = generateStructuredData("software", {
    name: "Journve",
    description: "Journve 是您的智能旅行助手。轻松规划旅行，离线记录支出与日记，无广告，无混乱。",
    url: "https://journve.com",
    inLanguage: "zh",
    aggregateRating: {
      ratingValue: "4.9",
      reviewCount: "128",
    },
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* This page is primarily for SEO/ASO. Add content here if needed, but keep it minimal as per instructions. */}
      <h1 className="text-2xl font-bold">Journve：您的智能旅行伴侣</h1>
      <p className="text-center mt-4">
        无广告，无混乱。Journve 帮您轻松规划行程、记录支出、书写旅行日记，完全离线使用。
      </p>
      {/* Inject JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}
