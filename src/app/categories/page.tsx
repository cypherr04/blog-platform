"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  post_count: number
}

// Function to generate a consistent color based on string
const getTagColor = (str: string) => {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-800", hover: "hover:bg-blue-200" },
    { bg: "bg-green-100", text: "text-green-800", hover: "hover:bg-green-200" },
    { bg: "bg-purple-100", text: "text-purple-800", hover: "hover:bg-purple-200" },
    { bg: "bg-yellow-100", text: "text-yellow-800", hover: "hover:bg-yellow-200" },
    { bg: "bg-red-100", text: "text-red-800", hover: "hover:bg-red-200" },
    { bg: "bg-indigo-100", text: "text-indigo-800", hover: "hover:bg-indigo-200" },
    { bg: "bg-pink-100", text: "text-pink-800", hover: "hover:bg-pink-200" },
    { bg: "bg-teal-100", text: "text-teal-800", hover: "hover:bg-teal-200" },
    { bg: "bg-orange-100", text: "text-orange-800", hover: "hover:bg-orange-200" },
    { bg: "bg-cyan-100", text: "text-cyan-800", hover: "hover:bg-cyan-200" },
  ]

  // Simple hash function to get consistent index
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`, {
      cache: "no-store", // Don't cache so we get fresh post counts
    })

    if (!res.ok) {
      throw new Error("Failed to fetch categories")
    }

    const result = await res.json()
    return result.data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await getCategories()
      setCategories(fetchedCategories)
      setLoading(false)
    }
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort categories by post count (descending) and then by name
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (b.post_count !== a.post_count) {
      return b.post_count - a.post_count
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Explore Categories</h1>
          <p className="text-lg md:text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Discover content organized by topics that interest you most
          </p>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 pr-12 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white p-8 rounded-xl shadow-sm inline-block max-w-md">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {searchQuery ? "No categories found" : "No Categories Available"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No categories match "${searchQuery}". Try a different search term.`
                  : "Categories will appear here once they are created."}
              </p>
              {!searchQuery && (
                <Link
                  href="/dashboard"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery ? `Search Results for "${searchQuery}"` : "All Categories"}
              </h2>
              <p className="text-gray-600">
                {sortedCategories.length} {sortedCategories.length === 1 ? "category" : "categories"} available
                {!searchQuery && (
                  <span className="ml-2">
                    • {sortedCategories.reduce((total, cat) => total + cat.post_count, 0)} total articles
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCategories.map((category) => {
                const colorScheme = getTagColor(category.name)
                const icon = getCategoryIcon(category.name)

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 ${colorScheme.hover}`}
                  >
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${colorScheme.bg} flex items-center justify-center mb-4`}>
                        <span className="text-2xl">{icon}</span>
                      </div>

                      <h3
                        className={`text-lg font-semibold mb-2 ${colorScheme.text} group-hover:text-purple-700 transition-colors`}
                      >
                        {category.name}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description || `Explore articles and insights about ${category.name.toLowerCase()}.`}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">{category.post_count}</span>{" "}
                          {category.post_count === 1 ? "article" : "articles"}
                        </span>
                        <div className="text-purple-600 group-hover:text-purple-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Progress bar showing relative popularity */}
                      {categories.length > 0 && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${colorScheme.bg.replace("100", "400")}`}
                              style={{
                                width: `${Math.max(
                                  10,
                                  (category.post_count / Math.max(...categories.map((c) => c.post_count), 1)) * 100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </section>

      {/* Featured Categories Section */}
      {!searchQuery && sortedCategories.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Most Popular Categories</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the most engaging content across our most active categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedCategories
                .filter((cat) => cat.post_count > 0)
                .slice(0, 3)
                .map((category, index) => {
                  const colorScheme = getTagColor(category.name)
                  const icon = getCategoryIcon(category.name)

                  return (
                    <div
                      key={category.id}
                      className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-16 h-16 rounded-xl ${colorScheme.bg} flex items-center justify-center`}>
                            <span className="text-3xl">{icon}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{category.post_count}</div>
                            <div className="text-xs text-gray-500">
                              {category.post_count === 1 ? "article" : "articles"}
                            </div>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                        <p className="text-gray-600 mb-6 line-clamp-3">
                          {category.description ||
                            `Discover the latest trends and insights in ${category.name.toLowerCase()}.`}
                        </p>

                        <Link
                          href={`/categories/${category.slug}`}
                          className={`inline-flex items-center space-x-2 ${colorScheme.text} hover:text-purple-700 font-medium transition-colors`}
                        >
                          <span>Explore {category.name}</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>

                      <div className="absolute top-4 right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
                        {icon}
                      </div>

                      {/* Ranking badge */}
                      <div className="absolute top-2 left-2">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Show message if no categories have posts */}
            {sortedCategories.filter((cat) => cat.post_count > 0).length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 p-8 rounded-xl inline-block">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to publish content in any category!</p>
                  <Link
                    href="/dashboard/posts/new"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Write First Article
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

// Function to get category icon based on name
function getCategoryIcon(categoryName: string) {
  const icons: { [key: string]: string } = {
    Technology: "💻",
    Science: "🔬",
    Lifestyle: "🌟",
    Health: "🏥",
    "Health & Wellness": "🏥",
    Business: "💼",
    Education: "📚",
    Travel: "✈️",
    Food: "🍽️",
    "Food & Cooking": "🍽️",
    Sports: "⚽",
    Entertainment: "🎬",
    "Arts & Culture": "🎨",
    Finance: "💰",
    "Personal Development": "🚀",
  }
  return icons[categoryName] || "📝"
}
