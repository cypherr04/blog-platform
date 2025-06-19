import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabaseServer"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id } = params

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", id).single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Fetch profile posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles!inner(id, full_name, avatar_url),
        categories(id, name, slug)
      `)
      .eq("user_id", id)
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false })

    if (postsError) {
      console.error("Error fetching profile posts:", postsError)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    return NextResponse.json({
      profile,
      posts: posts || [],
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
