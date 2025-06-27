import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">ContentAI</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering content creators with AI-driven blog generation and optimization tools.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Product</h3>
            <div className="space-y-2">
              <Link href="#features" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
              <Link href="#demo" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Demo
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Company</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-400 hover:text-white text-sm transition-colors">
                About
              </Link>
              <Link href="/blog" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Support</h3>
            <div className="space-y-2">
              <Link href="/help" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Help Center
              </Link>
              <Link href="/privacy" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2024 ContentAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
