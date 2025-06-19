import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") || "12"

    console.log("Fetching posts for category:", params.slug)

    // First, get the category by slug
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", params.slug)
      .single()

    if (categoryError) {
      console.error("Error fetching category:", categoryError)
      return NextResponse.json({ data: null, error: "Category not found" }, { status: 404 })
    }

    if (!category) {
      return NextResponse.json({ data: null, error: "Category not found" }, { status: 404 })
    }

    // Then fetch posts for this category
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          email
        ),
        categories:category_id (
          id,
          name,
          slug
        )
      `)
      .eq("category_id", category.id)
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false })
      .limit(Number.parseInt(limit))

    if (postsError) {
      console.error("Error fetching posts:", postsError)
      throw postsError
    }

    console.log(`Found ${posts?.length || 0} posts for category ${category.name}`)

    return NextResponse.json({
      data: {
        category,
        posts: posts || [],
      },
      error: null,
    })
  } catch (error: any) {
    console.error("API Error fetching posts by category:", error)
    return NextResponse.json(
      {
        data: null,
        error: error.message || "Failed to fetch posts",
      },
      { status: 500 },
    )
  }
}
