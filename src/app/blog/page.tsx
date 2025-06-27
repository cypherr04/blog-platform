"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/lib/types"

export default function BlogPage() {
  const [categories, setCategories] = useState([{ id: "all", name: "All Categories", slug: "all", post_count: 0 }])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`)
        if (res.ok) {
          const result = await res.json()
          const realCategories = result.data || []
          setCategories([
            {
              id: "all",
              name: "All Categories",
              slug: "all",
              post_count: realCategories.reduce((total: number, cat: any) => total + (cat.post_count || 0), 0),
            },
            ...realCategories.slice(0, 4).map((cat: any) => ({
              ...cat,
              post_count: cat.post_count || 0,
            })),
          ])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  async function getPosts(): Promise<{ posts: Post[]; error?: string }> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const apiUrl = `${baseUrl}/api/posts?limit=12`

      const res = await fetch(apiUrl, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status}`)
      }

      const result = await res.json()
      return { posts: result.data || [] }
    } catch (error: any) {
      console.error("Error fetching posts:", error)
      return { posts: [], error: error.message }
    }
  }

  useEffect(() => {
    async function fetchPosts() {
      const { posts: fetchedPosts, error: fetchError } = await getPosts()
      setPosts(fetchedPosts)
      setError(fetchError || null)
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Technology: "bg-blue-100 text-blue-800",
      AI: "bg-purple-100 text-purple-800",
      "Web Dev": "bg-green-100 text-green-800",
      Design: "bg-pink-100 text-pink-800",
      Marketing: "bg-orange-100 text-orange-800",
      Lifestyle: "bg-yellow-100 text-yellow-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  const handleCategoryFilter = async (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    setLoading(true)

    try {
      if (categorySlug !== "all") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/posts/category/${categorySlug}`,
        )
        if (res.ok) {
          const result = await res.json()
          setPosts(result.data?.posts || [])
        }
      } else {
        const { posts: allPosts } = await getPosts()
        setPosts(allPosts)
      }
    } catch (error) {
      console.error("Error filtering posts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Discover Amazing Stories</h1>
          <p className="text-lg md:text-xl mb-10 text-purple-100 max-w-2xl mx-auto">
            AI-powered content creation and curation platform
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles, topics, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Filters and Categories */}
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                  />
                </svg>
                <span className="text-sm font-medium">Filters</span>
              </button>

              <div className="hidden md:flex items-center space-x-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                      selectedCategory === category.slug
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <span>{category.name}</span>
                    {category.post_count !== undefined && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                        {category.post_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - Sort and View options */}
            <div className="flex items-center space-x-4">
              <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer">
                <option>Newest</option>
                <option>Popular</option>
                <option>Trending</option>
              </select>

              <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 p-8 rounded-lg shadow-md inline-block max-w-md">
              <h3 className="text-xl font-semibold mb-2 text-red-800">Error Loading Posts</h3>
              <p className="text-red-600 mb-6">{error}</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white p-8 rounded-lg shadow-md inline-block max-w-md">
              <h3 className="text-xl font-semibold mb-2">No Articles Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to publish content on this platform!</p>
              <Link
                href="/dashboard/posts/new"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Create Your First Post
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group relative"
              >
                {/* Main card link - covers entire card */}
                <Link href={`/posts/${post.slug}`} className="block">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={post.image_url || "https://via.placeholder.com/800x400"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor("Technology")}`}>
                        Technology
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{post.summary}</p>
                  </div>
                </Link>

                {/* Author section - separate clickable area */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/profile/${post.profiles?.id || "unknown"}`}
                      className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {post.profiles?.avatar_url ? (
                          <Image
                            src={post.profiles.avatar_url || "/placeholder.svg"}
                            alt={post.profiles.full_name || "Author"}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-medium">
                              {post.profiles?.full_name?.charAt(0) || "A"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors">
                          {post.profiles?.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>{post.view_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>24</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
