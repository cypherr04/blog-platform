import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const category = searchParams.get("category") || "all"
    const sortBy = searchParams.get("sortBy") || "latest"

    let query = supabase
      .from("posts")
      .select(`
        *,
        categories:category_id (name),
        post_tags (
          tags:tag_id (name)
        )
      `)
      .eq("user_id", user.id)

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    if (status !== "all") {
      query = query.eq("status", status.toUpperCase())
    }

    if (category !== "all") {
      query = query.eq("category_id", category)
    }

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
      default:
        query = query.order("created_at", { ascending: false })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: posts, error: postsError } = await query.range(from, to).limit(limit)

    if (postsError) throw postsError

    const { count: totalCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

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
