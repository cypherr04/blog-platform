import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const category = searchParams.get("category") || "all"
    const sortBy = searchParams.get("sortBy") || "latest"

    // Try to get session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    let query = supabase
      .from("posts")
      .select(`
        *,
        categories:category_id (name),
        post_tags (
          tags:tag_id (name)
        )
      `)
      .eq("user_id", userId)

    // Apply filters
    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    if (status !== "all") {
      query = query.eq("status", status.toUpperCase())
    }

    if (category !== "all") {
      query = query.eq("category_id", category)
    }

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "views":
        query = query.order("view_count", { ascending: false })
        break
      case "title":
        query = query.order("title", { ascending: true })
        break
      default: // latest
        query = query.order("created_at", { ascending: false })
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: posts, error: postsError } = await query.range(from, to).limit(limit)

    if (postsError) throw postsError

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error("Dashboard posts error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
