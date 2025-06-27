import { Sparkles, FileText, Search, ImageIcon, Users, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Generate high-quality content instantly using advanced AI and provide customized keywords.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: FileText,
    title: "Rich Text Editor",
    description: "Professional editor with formatting tools, image uploads, and interactive customization features.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Built-in SEO tools and keyword optimization. Improve search engine ranking with AI.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: ImageIcon,
    title: "AI Image Generation",
    description: "Generate stunning featured images and illustrations for your blog posts using AI.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Complete user administration, profiles, and role-based access control system.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track blog performance and detailed analytics with engagement insights.",
    color: "bg-blue-100 text-blue-600",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to create and publish amazing blog content with AI assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
