import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import "@/styles/responsive.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Toaster } from "@/components/ui/toaster"
import { PreloaderWrapper } from "@/components/preloader-wrapper"
import { generateMetadata as generateSEOMetadata, generateStructuredData } from "@/lib/seo"
import { StructuredData } from "@/components/seo/structured-data"
import { JoinCommunityButton } from "@/components/join-community-button"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = generateSEOMetadata({
  title: "Journve - Your Ultimate Travel Companion",
  description:
    "Plan, journal, and track expenses — all in one place. Journve is the smartest way to travel solo or with friends.",
  keywords: [
    "travel planner",
    "trip planning",
    "travel organizer",
    "vacation planner",
    "travel itinerary",
    "travel app",
    "travel companion",
    "travel management",
    "expense tracker",
    "travel journal",
    "group travel",
    "solo travel",
  ],
  url: "/",
  type: "website",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
}

const websiteStructuredData = generateStructuredData("website", {})
const softwareStructuredData = generateStructuredData("software", {})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-V0F5YB06XQ"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V0F5YB06XQ');
          `,
          }}
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/images/favicon-new.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/images/favicon-new.webp" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <StructuredData data={websiteStructuredData} />
        <StructuredData data={softwareStructuredData} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <PreloaderWrapper />
            <AuthGuard>{children}</AuthGuard>
            <Toaster />
            <JoinCommunityButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
