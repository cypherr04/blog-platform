"use client"

import { useEffect } from "react"

import { useState } from "react"

import type React from "react"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import DemoSection from "@/components/landing/DemoSection"
import PricingSection from "@/components/landing/PricingSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"
import type { Post } from "@/lib/types"

export default function HomePage() {
  // Replace the mock categories with real data fetching
  const [categories, setCategories] = useState([{ id: "all", name: "All Categories", slug: "all", post_count: 0 }])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  // Add this useEffect to fetch real categories
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
            })), // Show only first 4 categories in filter
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
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  // Update the category filtering logic
  const handleCategoryFilter = async (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    setLoading(true)

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/posts?limit=12`

      if (categorySlug !== "all") {
        // Fetch posts for specific category
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/posts/category/${categorySlug}`,
        )
        if (res.ok) {
          const result = await res.json()
          setPosts(result.data?.posts || [])
        }
      } else {
        // Fetch all posts
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Demo Section */}
      <DemoSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
