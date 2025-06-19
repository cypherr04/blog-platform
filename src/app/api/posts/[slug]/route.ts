import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    // Fetch the post with author and category
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (*),
        categories:category_id (*)
      `)
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .single()

    if (postError) {
      if (postError.code === "PGRST116") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 })
      }
      throw postError
    }

    // Fetch post tags
    const { data: postTags, error: tagsError } = await supabase
      .from("post_tags")
      .select(`
        tags:tag_id (
          id,
          name,
          slug
        )
      `)
      .eq("post_id", post.id)

    if (tagsError) throw tagsError

    // Extract tags from the nested structure
    const tags = postTags?.map((pt: any) => pt.tags).filter(Boolean) || []

    // Increment view count
    await supabase
      .from("posts")
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq("id", post.id)

    return NextResponse.json({
      success: true,
      data: {
        post: { ...post, view_count: (post.view_count || 0) + 1 },
        author: post.profiles,
        tags: tags,
      },
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
