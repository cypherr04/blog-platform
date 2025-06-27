import Link from "next/link"
import { Sparkles, MoreHorizontal } from "lucide-react"

export default function HeroSection() {
  return (
    <section id="hero" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Create Amazing <span className="text-purple-600">Blog Content</span> with AI
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Generate, edit, and publish professional blog posts using advanced AI. Complete with SEO optimization,
                rich text editing, and smart content suggestions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Start Creating Now
              </Link>
              <Link
                href="#demo"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
              >
                Watch Demo
              </Link>
            </div>
          </div>

          {/* Right Content - Blog Generator Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-600">AI Blog Generator</span>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Enter your blog title...</label>
                  <div className="w-full h-12 bg-gray-100 rounded-lg"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Add keywords or topic</label>
                  <div className="w-3/4 h-10 bg-gray-100 rounded-lg"></div>
                </div>

                <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
