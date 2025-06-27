import { Play, CheckCircle } from "lucide-react"

export default function DemoSection() {
  return (
    <section id="demo" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">See It In Action</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the power of AI-driven content creation</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
          {/* Demo Interface Header */}
          <div className="bg-gray-900 px-6 py-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white text-sm ml-4">ContentAI</span>
          </div>

          {/* Demo Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Steps */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Input Your Ideas</h3>
                      <p className="text-gray-600 text-sm">Tell us about your topic, keywords, and target audience</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Generates Content</h3>
                      <p className="text-gray-600 text-sm">Our AI creates engaging, SEO-optimized content in seconds</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Review and Publish</h3>
                      <p className="text-gray-600 text-sm">Edit, customize, and publish your content with one click</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Preview */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">10 Tips for Remote Work Productivity</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Remote work productivity can be challenging without the right strategies. What's most important is
                    creating a dedicated workspace, maintaining consistent routines, and leveraging technology to stay
                    connected with your team...
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>SEO optimized content</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Engaging headlines</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Ready to publish</span>
                  </div>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Try It Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
