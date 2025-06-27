import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: 9,
    period: "month",
    description: "Perfect for individuals",
    features: ["Basic AI content generation", "Basic SEO optimization", "5 blog posts per month", "Image uploads"],
    buttonText: "Get Started",
    buttonStyle: "border border-gray-300 hover:border-gray-400 text-gray-700",
  },
  {
    name: "Professional",
    price: 29,
    period: "month",
    description: "For serious content creators",
    features: ["Advanced AI tools", "AI image generation", "Analytics dashboard", "Priority support"],
    buttonText: "Get Started",
    buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "For teams and agencies",
    features: ["Custom AI training", "Team collaboration", "White-label options", "24/7 dedicated support"],
    buttonText: "Contact Sales",
    buttonStyle: "border border-gray-300 hover:border-gray-400 text-gray-700",
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your content creation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl border-2 p-8 relative ${
                plan.popular ? "border-purple-600" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center space-y-4 mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/register"}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors text-center block ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
