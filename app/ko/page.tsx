import type { Metadata } from "next"
import { generateStructuredData } from "@/lib/seo" // Import generateStructuredData

export const metadata: Metadata = {
  title: "Journve: 당신의 스마트 여행 동반자",
  description:
    "광고 없이, 혼란 없이. Journve로 간편하게 여행을 계획하고, 경비를 관리하며, 추억을 기록하세요. 오프라인에서도 사용 가능.",
  keywords: "스마트 여행 앱, 여행 플래너, 여행 경비 추적, 오프라인 여행, 여행 다이어리, 광고 없는 앱, Journve",
  openGraph: {
    title: "Journve: 스마트 여행 앱",
    description: "여행을 간편하게. 오프라인 가능, 광고 없음. 여행 플래너 + 경비 추적 + 다이어리",
    url: "https://journve.com", // Corrected URL
    siteName: "Journve",
    locale: "ko_KR", // Explicitly set locale
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journve: 혼란 없는 여행",
    description: "일정과 경비를 기록하세요. 스마트하고 프라이버시 중심의 여행 동반자.",
  },
  alternates: {
    canonical: "https://journve.com", // Corrected URL
    languages: {
      ko: "https://journve.com/", // Corrected URL
      en: "https://journve.com", // Corrected URL
      es: "https://journve.com/", // Corrected URL
      "zh-CN": "https://journve.com/", // Corrected URL
      "x-default": "https://journve.com", // Add x-default
    },
  },
  other: {
    language: "ko", // Explicitly set language meta tag
  },
}

export default function KoreanPage() {
  const jsonLd = generateStructuredData("software", {
    name: "Journve",
    description:
      "Journve는 스마트한 여행 동반자입니다. 간편한 여행 계획, 경비 추적, 여행 일기. 오프라인 사용 가능, 광고 없음.",
    url: "https://journve.com/ko",
    inLanguage: "ko",
    aggregateRating: {
      ratingValue: "4.9",
      reviewCount: "128",
    },
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <h1 className="text-4xl font-bold text-center mb-4">Journve: 당신의 스마트 여행 동반자</h1>
        <p className="text-lg text-center max-w-2xl">
          Journve는 스마트한 여행 동반자입니다. 간편한 여행 계획, 경비 추적, 여행 일기. 오프라인 사용 가능, 광고 없음.
        </p>
        <p className="text-md text-center mt-4">더 많은 정보는 곧 제공될 예정입니다.</p>
      </main>
    </>
  )
}
