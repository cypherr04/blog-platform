"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/types"

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryPageData {
  category: Category | null
  posts: Post[]
}

async function getCategoryPosts(slug: string): Promise<CategoryPageData> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/posts/category/${slug}`,
      {
        cache: "no-store",
      },
    )

    const result = await res.json()

    // Always return data, even if category not found
    return {
      category: result.data?.category || null,
      posts: result.data?.posts || [],
    }
  } catch (error) {
    console.error("Error fetching category posts:", error)
    return {
      category: null,
      posts: [],
    }
  }
}

export default function CategoryPostsPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<CategoryPageData>({ category: null, posts: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const result = await getCategoryPosts(params.slug)
      setData(result)
      setLoading(false)
    }

    fetchData()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    )
  }

  // If category doesn't exist, show category not found page
  if (!data.category) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section for Not Found */}
        <section className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Category Not Found</h1>
            <p className="text-lg md:text-xl text-red-100 mb-8">
              The category "{params.slug}" doesn't exist or may have been removed.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-white p-12 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What would you like to do?</h2>
              <p className="text-gray-600 mb-8">
                This category might not exist yet, or there might be a typo in the URL.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/categories"
                  className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Browse All Categories</span>
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Go Home</span>
                </Link>

                <Link
                  href="/dashboard/posts/new"
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create New Post</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const { category, posts } = data

  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      Technology: { bg: "bg-blue-100", text: "text-blue-800" },
      Science: { bg: "bg-green-100", text: "text-green-800" },
      Lifestyle: { bg: "bg-purple-100", text: "text-purple-800" },
      Health: { bg: "bg-red-100", text: "text-red-800" },
      Business: { bg: "bg-yellow-100", text: "text-yellow-800" },
      Education: { bg: "bg-indigo-100", text: "text-indigo-800" },
    }
    return colors[categoryName] || { bg: "bg-gray-100", text: "text-gray-800" }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-purple-200 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/categories" className="hover:text-white transition-colors">
              Categories
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">{category.name}</span>
          </nav>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            <p className="text-lg md:text-xl text-purple-100 mb-6">
              {posts.length} {posts.length === 1 ? "article" : "articles"} in this category
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          /* Empty State - No Posts */
          <div className="text-center py-20">
            <div className="bg-white p-12 rounded-xl shadow-sm inline-block max-w-lg">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Articles Yet in {category.name}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                This category exists but doesn't have any published articles yet. Be the first to contribute content
                about <strong>{category.name}</strong>!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/posts/new"
                  className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Write First Article</span>
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Browse Other Categories</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Posts Grid */
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
                <p className="text-gray-600 mt-1">
                  Discover the latest content in <strong>{category.name}</strong>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={post.image_url || "https://via.placeholder.com/800x400"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.name).bg} ${getCategoryColor(category.name).text}`}
                      >
                        {category.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{post.summary}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
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
                          <p className="text-sm font-medium text-gray-900">{post.profiles?.full_name || "Anonymous"}</p>
                          <p className="text-xs text-gray-500">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                          </p>
                        </div>
                      </div>

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
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {posts.length >= 12 && (
              <div className="text-center mt-12">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Related Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore Other Categories</h2>
            <p className="text-gray-600">Discover more content across different topics</p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/categories"
              className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              <span>View All Categories</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
