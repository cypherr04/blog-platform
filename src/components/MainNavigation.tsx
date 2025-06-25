"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface UserWithProfile extends User {
  profile?: Profile
}

export default function MainNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  // Create Supabase client once
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Fetch user with profile in a single optimized call
  const fetchUserWithProfile = useCallback(
    async (userId: string) => {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", userId)
          .single()

        return profileData
      } catch (error) {
        console.error("Error fetching profile:", error)
        return null
      }
    },
    [supabase],
  )

  // Initialize auth state efficiently
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          // Fetch profile data only if we have a user
          const profile = await fetchUserWithProfile(session.user.id)

          if (mounted) {
            setUser({
              ...session.user,
              profile: profile || undefined,
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes with optimized handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserWithProfile(session.user.id)
        setUser({
          ...session.user,
          profile: profile || undefined,
        })
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserWithProfile])

  // Close menus when clicking outside - optimized
  useEffect(() => {
    if (!isMenuOpen && !isProfileMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-menu="mobile"]') && !target.closest('[data-menu="profile"]')) {
        setIsMenuOpen(false)
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen, isProfileMenuOpen])

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen((prev) => !prev)
    setIsProfileMenuOpen(false)
  }, [])

  const toggleProfileMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsProfileMenuOpen((prev) => !prev)
    setIsMenuOpen(false)
  }, [])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    setIsProfileMenuOpen(false)
    router.push("/")
  }, [supabase, router])

  // Optimized loading state
  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ContentAI</span>
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  // Get display values
  const displayName = user?.profile?.full_name || "User"
  const avatarUrl = user?.profile?.avatar_url
  const userInitial = displayName.charAt(0) || user?.email?.charAt(0) || "U"

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ContentAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { href: "/", label: "Home" },
              { href: "/trending", label: "Trending" },
              { href: "/categories", label: "Categories" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
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
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
                  data-menu="profile"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl || "/placeholder.svg"}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 text-sm font-medium">{userInitial}</span>
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
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {[
                      { href: "/dashboard", label: "Dashboard" },
                      { href: "/dashboard/profile", label: "Profile" },
                      { href: "/dashboard/settings", label: "Settings" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
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
              aria-label="Toggle menu"
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
              {[
                { href: "/", label: "Home" },
                { href: "/trending", label: "Trending" },
                { href: "/categories", label: "Categories" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-gray-100">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {[
                    { href: "/dashboard", label: "Dashboard" },
                    { href: "/dashboard/profile", label: "Profile" },
                    { href: "/dashboard/settings", label: "Settings" },
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-gray-50 rounded-md"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
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
