import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service - Journve",
  description: "Terms and conditions for using the Journve platform.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-hero-gradient dark:bg-none py-12 md:py-20">
        <div className="container px-4 md:px-8 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using our platform.
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
                These Terms and Conditions ("Terms") govern your use of the Journve application. By accessing or using
                our app, you agree to these Terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Use of the App</h2>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>Journve provides tools for planning trips, tracking expenses, and maintaining travel journals.</li>
                <li>You agree to use the app only for lawful purposes.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. User Accounts</h2>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>Authentication is only via Google Sign-In.</li>
                <li>You are responsible for safeguarding your account access credentials.</li>
                <li>You may not impersonate others or misuse account functionalities.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. User Data & Content</h2>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>You retain ownership of your personal trip data, journal entries, and expense logs.</li>
                <li>
                  You grant Journve the right to store, back up, and display your data solely to provide services to
                  you.
                </li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Prohibited Conduct</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>Abuse or exploit features (e.g., submitting fake expenses or spamming).</li>
                <li>Reverse-engineer or tamper with the app.</li>
                <li>Violate the privacy or rights of other users.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
              <p className="mb-3">Journve is provided "as is" without warranties of any kind. We are not liable for:</p>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>Loss of data, service interruptions, or inaccurate calculations (e.g., exchange rates).</li>
                <li>User-submitted content errors.</li>
                <li>Consequential damages from app usage.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Termination</h2>
              <ul className="space-y-3 mb-6 list-disc pl-5">
                <li>You may delete your account at any time via Settings.</li>
                <li>We may suspend or terminate your access if you violate these terms or misuse the app.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Modifications to Terms</h2>
              <p className="mb-6">
                We may update these Terms from time to time. Continued use after changes means you accept the new Terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact</h2>
              <p className="mb-6">
                For support or questions, contact us at{" "}
                <a href="mailto:askjournve@gmail.com" className="text-primary hover:underline">
                  ask.journve@gmail.com
                </a>
                .
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mt-12">
                <p className="font-medium">
                  By using Journve, you acknowledge that you have read and understood these Terms and agree to be bound
                  by them.
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
