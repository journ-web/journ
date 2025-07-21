import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy - Journve",
  description: "Privacy policy for the Journve platform.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-hero-gradient dark:bg-none py-12 md:py-20">
        <div className="container px-4 md:px-8 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            How we collect, use, and protect your personal information.
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
                Journve ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
                we collect, use, and safeguard your information when you use our application.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Personal Information:</span>
                  <span>Name, email address (via Google Sign-In only).</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Trip Data:</span>
                  <span>Information related to trip planning, expenses, journal entries, and Splitly group data.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Device Information:</span>
                  <span>Anonymous analytics (device type, OS version, usage patterns) to improve functionality.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Location (Optional):</span>
                  <span>If explicitly provided within trip context.</span>
                </li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>
                  To provide and maintain core app features like trip planning, expense tracking, journaling, and group
                  expense management.
                </li>
                <li>To personalize user experience and improve our services.</li>
                <li>To communicate updates, support messages, or changes in our services.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Storage and Security</h2>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>
                  Your data is securely stored via <strong>Firebase (Google Cloud Platform)</strong> with encryption and
                  secure authentication.
                </li>
                <li>We do not share or sell your data to third parties.</li>
                <li>Access to user data is strictly scoped and protected using Firebase Authentication.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. User Control & Access</h2>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>You can delete your account and all associated data at any time through the Settings page.</li>
                <li>You may request full deletion of data by contacting support at helpmejournve@gmail.com.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Third-Party Services</h2>
              <p className="mb-6">
                We rely on Firebase and other tools (e.g., currency APIs) which have their own privacy policies. We do
                not share personal data directly with these services.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Children's Privacy</h2>
              <p className="mb-6">
                Our app is not intended for users under the age of 13. We do not knowingly collect data from minors.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Updates to This Policy</h2>
              <p className="mb-6">
                We may update this policy periodically. Changes will be notified within the app or via email.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mt-12">
                <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
                <p>
                  If you have any questions about our Privacy Policy or data practices, please contact us at{" "}
                  <a href="mailto:askjournve@gmail.com" className="text-primary hover:underline">
                    ask.journve@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
