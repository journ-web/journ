import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <main className="min-h-screen pt-20">
      <Header />

      <section className="py-24 md:py-32">
        <div className="container px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-full mx-auto" />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-black rounded-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-900 shadow-sm">
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>

                <div className="pt-4">
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-900">
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
