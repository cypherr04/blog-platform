import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-20 bg-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white">Ready to Transform Your Content Creation?</h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Join thousands of content creators who are already using AI to write better, faster, and smarter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
            >
              Start Free Trial
            </Link>
            <Link
              href="#demo"
              className="border-2 border-white hover:bg-white hover:text-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
