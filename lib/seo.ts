import type { Metadata } from "next"

export interface SEOConfig {
  title: string
  description: string
  pageType?: keyof typeof keywordCategoriesOverrides // For dynamic keyword selection
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  locale?: string // Added for language meta tag
}

// Default site-wide SEO settings
const defaultSEO = {
  siteName: "Journve",
  siteUrl: "https://journve.com", // Corrected URL
  defaultTitle: "Journve - Your Ultimate Travel Companion",
  defaultDescription:
    "Where planning ends, Journve begins. Journve combines powerful planning tools, expense tracking, and collaborative features to transform your travel experience from start to finish",
  defaultImage: "/images/jvlogo.png",
  twitterHandle: "@journve",
}

// Keyword groups by category
export const seoKeywords = {
  travel: [
    "travel planner",
    "trip planner",
    "itinerary builder",
    "vacation planner",
    "trip organizer",
    "route planner",
    "travel dashboard",
    "travel scheduling",
    "holiday planning",
    "trip management",
    "travel toolkit",
    "travel guide",
    "digital travel assistant",
    "online trip planner",
    "AI travel assistant",
    // You can add more keywords from the 'allKeywords' list here if desired
  ],
  expense: [
    "trip expense tracker",
    "group expense app",
    "expense splitting",
    "travel budgeting",
    "splitwise alternative",
    "trip cost calculator",
    "travel money manager",
    "budget travel app",
    "multi-currency expense tracker",
    "travel wallet",
    // You can add more keywords from the 'allKeywords' list here if desired
  ],
  journal: [
    "travel journal",
    "vacation diary",
    "trip log",
    "photo travel diary",
    "group travel stories",
    "travel memories",
    "personal travel blog",
    "digital travel storytelling",
    "trip documentation",
    // You can add more keywords from the 'allKeywords' list here if desired
  ],
  /** Generic travel-related keywords shared across the whole site */
  general: [
    "smart travel",
    "travel technology",
    "travel tips",
    "travel guide",
    "travel companion",
    "travel inspiration",
    "online travel planner",
    "AI travel assistant",
    "private travel app",
    "ad-free travel app",
  ],
  community: [
    "travel community",
    "solo travel",
    "digital nomads",
    "family travel",
    "couples travel app",
    "business travelers",
    "traveler network",
    "friends trip planning",
    "travel social app",
    "group trip coordination",
    // You can add more keywords from the 'allKeywords' list here if desired
  ],
  booking: [
    "flight booking",
    "hotel booking",
    "accommodation booking",
    "package booking",
    "tour booking",
    "activity booking",
    "travel deals",
    "compare travel prices",
    "last-minute travel deals",
    "flexible travel booking",
    // You can add more keywords from the 'allKeywords' list here if desired
  ],
  intelligence: [
    "travel insights",
    "trip analytics",
    "smart travel AI",
    "real-time travel data",
    "AI itinerary suggestions",
    "travel tips generator",
    "optimize travel expenses",
    "personalized travel insights",
    "journey statistics",
    "analyze trip expenses",
    "AI trip suggestions",
    "personalized recommendations",
    "travel tips AI",
    "travel recommendations",
    // You can add more keywords from the 'allKeywords' list here if desired
  ],
  checklist: [
    "trip checklist",
    "packing list app",
    "travel to-do list",
    "reminders for trips",
    "group planning checklist",
    "trip prep tool",
    "group task manager",
    // You can add more keywords from the 'allKeywords' list here if desired
  ],
}

// Map page types to relevant keyword categories
const keywordCategoriesOverrides: Record<string, string[]> = {
  homepage: [...seoKeywords.travel, ...seoKeywords.community, ...seoKeywords.intelligence],
  dashboard: [...seoKeywords.travel, ...seoKeywords.expense, ...seoKeywords.intelligence],
  expense: [...seoKeywords.expense, ...seoKeywords.travel],
  journal: [...seoKeywords.journal, ...seoKeywords.community],
  booking: [...seoKeywords.booking, ...seoKeywords.travel],
  community: [...seoKeywords.community],
  checklist: [...seoKeywords.checklist, ...seoKeywords.travel],
  article: [...seoKeywords.journal, ...seoKeywords.travel],
}

// Pick the right keywords dynamically
function getSEOKeywords(config: SEOConfig): string[] {
  if (config.keywords && config.keywords.length > 0) return config.keywords
  const pageType = config.pageType || "homepage"
  return keywordCategoriesOverrides[pageType] || seoKeywords.travel
}

// Create metadata for each page
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    image = defaultSEO.defaultImage,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
    locale, // Use the new locale property
  } = config

  const keywords = getSEOKeywords(config)
  const fullTitle = title.includes("Journve") ? title : `${title} | ${defaultSEO.siteName}`
  const fullUrl = url ? `${defaultSEO.siteUrl}${url}` : defaultSEO.siteUrl
  const fullImage = image.startsWith("http") ? image : `${defaultSEO.siteUrl}${image}`

  return {
    title: fullTitle,
    description,
    ...(keywords.length > 0 && { keywords: keywords.join(", ") }),
    authors: author ? [{ name: author }] : [{ name: "Journve Team" }],
    creator: "Journve",
    publisher: "Journve",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type,
      locale: locale || "en_US", // Use provided locale or default to en_US
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: defaultSEO.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        updated_time: modifiedTime, // Added for consistency
        authors: author ? [author] : ["Journve Team"],
        section,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [fullImage],
      creator: defaultSEO.twitterHandle,
      site: defaultSEO.twitterHandle,
    },
    alternates: {
      canonical: fullUrl,
      languages: {
        en: `${defaultSEO.siteUrl}`,
        es: `${defaultSEO.siteUrl}/es`,
        "zh-CN": `${defaultSEO.siteUrl}/zh`,
        ko: `${defaultSEO.siteUrl}/ko`,
        ja: `${defaultSEO.siteUrl}/ja`,
        "x-default": `${defaultSEO.siteUrl}`, // Fallback for unspecified languages
      },
    },
    other: {
      "apple-mobile-web-app-title": defaultSEO.siteName,
      "application-name": defaultSEO.siteName,
      ...(locale && { language: locale }), // Dynamically add language meta tag
    },
  }
}

// Preserve the existing generateStructuredData function
export function generateStructuredData(type: "website" | "blog" | "faq" | "software", data: any) {
  const baseData = {
    "@context": "https://schema.org",
  }

  switch (type) {
    case "website":
      return {
        ...baseData,
        "@type": "WebSite",
        name: defaultSEO.siteName,
        url: defaultSEO.siteUrl,
        description: defaultSEO.defaultDescription,
        potentialAction: {
          "@type": "SearchAction",
          target: `${defaultSEO.siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }

    case "software":
      return {
        ...baseData,
        "@type": "SoftwareApplication",
        name: defaultSEO.siteName,
        description: defaultSEO.defaultDescription,
        url: defaultSEO.siteUrl,
        applicationCategory: "TravelApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1250",
        },
        author: {
          "@type": "Organization",
          name: defaultSEO.siteName,
        },
      }

    case "blog":
      return {
        ...baseData,
        "@type": "BlogPosting",
        headline: data.title,
        description: data.description,
        image: data.image,
        author: {
          "@type": "Person",
          name: data.author,
        },
        publisher: {
          "@type": "Organization",
          name: defaultSEO.siteName,
          logo: {
            "@type": "ImageObject",
            url: `${defaultSEO.siteUrl}${defaultSEO.defaultImage}`,
          },
        },
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": data.url,
        },
      }

    case "faq":
      return {
        ...baseData,
        "@type": "FAQPage",
        mainEntity: data.faqs.map((faq: any) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }

    default:
      return baseData
  }
}
