import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Get all cookies and find Supabase auth cookies
    const allCookies = cookieStore.getAll()
    const authCookies = allCookies.filter(
      (cookie) => cookie.name.includes("supabase") || cookie.name.includes("sb-") || cookie.name.includes("auth"),
    )

    console.log(
      "Available cookies:",
      allCookies.map((c) => c.name),
    )
    console.log(
      "Auth cookies found:",
      authCookies.map((c) => c.name),
    )

    if (authCookies.length === 0) {
      return NextResponse.json({ error: "No auth cookies found" }, { status: 401 })
    }

    // Try to get session using the client-side approach
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      console.log("Session error:", sessionError)
      return NextResponse.json({ error: "No valid session" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's posts with stats
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, status, view_count, created_at")
      .eq("user_id", userId)

    if (postsError) {
      console.error("Posts error:", postsError)
      throw postsError
    }

    // Calculate stats
    const totalPosts = posts?.length || 0
    const publishedPosts = posts?.filter((post) => post.status === "PUBLISHED").length || 0
    const draftPosts = posts?.filter((post) => post.status === "DRAFT").length || 0
    const totalViews = posts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(),
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
