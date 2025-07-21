import type { Metadata } from "next"
import { generateStructuredData } from "@/lib/seo" // Import generateStructuredData

export const metadata: Metadata = {
  title: "Journve：あなたのスマートな旅行パートナー",
  description:
    "広告なし、混乱なし。Journveで旅を整理し、出費を追跡し、思い出を記録しましょう。オフラインでも使用可能。",
  keywords: "旅行アプリ, スマート旅行, オフライン旅行, 旅行計画, 出費管理, 旅行日記, 広告なしアプリ, Journve",
  openGraph: {
    title: "Journve：スマート旅行アプリ",
    description: "シンプルな旅行体験を。旅程＋出費＋日記。広告なし・オフライン対応。",
    url: "https://journve.com", // Corrected URL
    siteName: "Journve",
    locale: "ja_JP", // Explicitly set locale
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journve：混乱なしの旅",
    description: "プライバシー重視の旅行管理アプリ。旅行を記録し、整理しよう。",
  },
  alternates: {
    canonical: "https://journve.com", // Corrected URL
    languages: {
      ja: "https://journve.com", // Corrected URL
      en: "https://journve.com", // Corrected URL
      es: "https://journve.com", // Corrected URL
      "zh-CN": "https://journve.com", // Corrected URL
      ko: "https://journve.com", // Corrected URL
      "x-default": "https://journve.com", // Add x-default
    },
  },
  other: {
    language: "ja", // Explicitly set language meta tag
  },
}

export default function JapanesePage() {
  const jsonLd = generateStructuredData("software", {
    name: "Journve",
    description:
      "Journveはスマートな旅行パートナーです。旅の計画、出費管理、日記記録。オフラインでも使え、広告は一切ありません。",
    url: "https://journve.com",
    inLanguage: "ja",
    aggregateRating: {
      ratingValue: "4.9",
      reviewCount: "128",
    },
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* JSON-LD script tag */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-4xl font-bold text-center">Journve：あなたのスマートな旅行パートナー</h1>
      <p className="mt-4 text-lg text-center max-w-2xl">
        広告なし、混乱なし。Journveで旅を整理し、出費を追跡し、思い出を記録しましょう。オフラインでも使用可能。
      </p>
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">Journveは、あなたの旅行体験をシンプルにするために設計されています。</p>
      </div>
    </main>
  )
}
