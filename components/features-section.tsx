import { CreditCard, PieChart, MapPin, Wallet, Globe, CheckSquare } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Currency Converter",
      description: "Real-time exchange rates with offline access for 150+ currencies.",
      badge: "Free",
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: "AI Budgeting",
      description: "Smart budget recommendations based on your destination and preferences.",
      badge: "Premium",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "ATM Locator",
      description: "Find fee-free ATMs worldwide with our interactive map.",
      badge: "Free",
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "Expense Tracker",
      description: "Categorize and monitor your spending with visual reports.",
      badge: "Free",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Offline Mode",
      description: "Access all your financial data without an internet connection.",
      badge: "Premium",
    },
    {
      icon: <CheckSquare className="h-6 w-6" />,
      title: "Split Bills",
      description: "Easily split expenses with travel companions and settle up.",
      badge: "Premium",
    },
  ]

  return (
    <section className="py-16 md:py-24" id="features">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-white/80 dark:bg-gray-800/80 px-3 py-1 text-sm shadow-sm backdrop-blur-sm">
            <span className="text-pink-500 font-medium">KEY FEATURES</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">We offer best services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Our platform provides everything you need for a perfect trip. From planning to booking, we've got you
            covered with our comprehensive set of features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 relative">
              <div className="absolute top-6 right-6">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    feature.badge === "Premium"
                      ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  }`}
                >
                  {feature.badge}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full w-fit">{feature.icon}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
