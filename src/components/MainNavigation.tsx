"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/lib/supabaseHelpers"

export default function MainNavigation() {
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      // Check if click is outside both menus
      if (!target.closest('[data-menu="mobile"]') && !target.closest('[data-menu="profile"]')) {
        setIsMenuOpen(false)
        setIsProfileMenuOpen(false)
      }
    }

    if (isMenuOpen || isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isMenuOpen, isProfileMenuOpen])

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
    setIsProfileMenuOpen(false)
  }

  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsProfileMenuOpen(!isProfileMenuOpen)
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ContentAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`}
              >
                Home
              </Link>
              <Link
                href="/trending"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/trending" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`}
              >
                Trending
              </Link>
              <Link
                href="/categories"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/categories" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/about" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`}
              >
                About
              </Link>
            </div>
          </div>

          {/* Right side - Write button and Profile */}
          <div className="flex items-center space-x-4">
            {/* Write Button */}
            {user && (
              <Link
                href="/dashboard/posts/new"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Write
              </Link>
            )}

            {/* Profile or Auth buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 focus:outline-none"
                  data-menu="profile"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={profile.full_name || "User"}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 text-sm font-medium">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                    data-menu="profile"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut()
                        window.location.href = "/"
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              data-menu="mobile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100" data-menu="mobile">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/trending"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Trending
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              {!user && (
                <div className="pt-4 border-t border-gray-100">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-base font-medium bg-purple-600 text-white rounded-md mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
