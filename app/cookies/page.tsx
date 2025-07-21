import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Cookie Policy - Journve",
  description: "Cookie policy for the Journve platform.",
}

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen pt-20">
      <Header />

      <section className="bg-hero-gradient dark:bg-none py-12 md:py-20">
        <div className="container px-4 md:px-8 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            How we use cookies and similar technologies on our platform.
          </p>
        </div>
      </section>

      <section className="py-12 flex-grow">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
            <div className="prose dark:prose-invert max-w-none">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm text-muted-foreground">Effective Date: May 15, 2025</p>
                <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  Last Updated: May 15, 2025
                </span>
              </div>

              <p className="text-lg leading-relaxed mb-6">
                This Cookie Policy explains how Journve ("we", "us", or "our") uses cookies and similar technologies
                when you visit or interact with our web application.
              </p>

              <p className="mb-8 font-medium">
                By using Journve, you agree to the use of cookies as described in this policy.
              </p>

              <div className="border-l-4 border-primary pl-4 mb-8">
                <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
                <p className="mb-6">
                  Cookies are small text files stored on your device (computer, tablet, or smartphone) by your browser
                  when you visit a website. They help websites remember information about your visit, like your
                  preferred language or login state, and enhance your overall user experience.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Types of Cookies We Use</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">a. Essential Cookies</h3>
                <p className="mb-3">
                  These are strictly necessary for the app to function correctly. Without these, features like login,
                  navigation, and secure access won't work.
                </p>
                <ul className="space-y-2 mb-6 list-disc pl-5">
                  <li>Authentication session (via Firebase Authentication)</li>
                  <li>Account status (e.g., logged in/out)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">b. Performance & Analytics Cookies</h3>
                <p className="mb-3">
                  We may use cookies or similar technologies (e.g., Firebase Analytics or Google Analytics) to
                  understand user behavior, how features are used, and to improve performance.
                </p>
                <ul className="space-y-2 mb-6 list-disc pl-5">
                  <li>Tracks anonymized user interaction</li>
                  <li>Helps us optimize layout, UX, and load times</li>
                </ul>

                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md my-4">
                  <p className="italic">
                    These cookies <strong>do not store personal information</strong> and are aggregated for statistical
                    purposes.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">c. Preference Cookies</h3>
                <p className="mb-3">
                  Used to remember your UI settings such as dark/light mode, selected language, or recent trips.
                </p>
                <ul className="space-y-2 mb-6 list-disc pl-5">
                  <li>Dark/Light mode preference</li>
                  <li>UI layout customization (optional)</li>
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4 mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Managing Cookies</h2>
                <p className="mb-3">Most browsers allow you to control or block cookies through settings. You can:</p>
                <ul className="space-y-2 mb-6 list-disc pl-5">
                  <li>Delete stored cookies</li>
                  <li>Disable all or selected types of cookies</li>
                </ul>
                <p className="mb-6">However, disabling essential cookies may limit the functionality of Journve.</p>
              </div>

              <div className="border-l-4 border-primary pl-4 mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
                <p className="mb-6">
                  We do not use third-party advertising cookies. However, services we rely on (like Firebase) may use
                  cookies or local storage for functionality and analytics. These are governed by their own privacy
                  policies.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Changes to This Cookie Policy</h2>
                <p className="mb-6">
                  We may update this Cookie Policy from time to time. Any significant changes will be communicated via
                  the app or email.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4 mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                <p className="mb-6">
                  If you have any questions about our Cookie Policy or data practices, feel free to reach out at{" "}
                  <a href="mailto:askjournve@gmail.com" className="text-primary hover:underline">
                    ask.journve@gmail.com
                  </a>
                  .
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mt-12">
                <h3 className="text-lg font-semibold mb-3">Cookie Preferences</h3>
                <p className="mb-4">
                  You can manage your cookie preferences at any time by adjusting your browser settings or through our
                  app settings.
                </p>
                <p>Essential cookies cannot be disabled as they are necessary for the app to function properly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
