import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, status, view_count, created_at")
      .eq("user_id", user.id)

    if (postsError) {
      console.error("Posts error:", postsError)
      throw postsError
    }

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
