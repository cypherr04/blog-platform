import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  console.log("[API] GET /api/posts - Starting request")

  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") || "6"
    const status = searchParams.get("status") || "PUBLISHED"

    console.log(`[API] GET /api/posts - Params: limit=${limit}, status=${status}`)

    const { data: postsWithProfiles, error: profileError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq("status", status)
      .order("published_at", { ascending: false })
      .limit(Number.parseInt(limit))

    if (profileError) {
      console.warn("[API] GET /api/posts - Error fetching posts with profiles, trying without profiles:", profileError)

      const { data: postsOnly, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("status", status)
        .order("published_at", { ascending: false })
        .limit(Number.parseInt(limit))

      if (postsError) {
        console.error("[API] GET /api/posts - Error fetching posts:", postsError)
        throw postsError
      }

      console.log(`[API] GET /api/posts - Success (without profiles): ${postsOnly?.length || 0} posts`)
      return NextResponse.json({ data: postsOnly || [], error: null })
    }

    console.log(`[API] GET /api/posts - Success (with profiles): ${postsWithProfiles?.length || 0} posts`)
    return NextResponse.json({ data: postsWithProfiles || [], error: null })
  } catch (error: any) {
    console.error("[API] GET /api/posts - Error:", error)
    return NextResponse.json(
      {
        data: null,
        error: error.message || "Failed to fetch posts",
        details: error,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  console.log("[API] POST /api/posts - Starting request")

  try {
    const supabase = await createClient()

    // Get the request body
    const body = await request.json()
    console.log("[API] POST /api/posts - Request body:", {
      title: body.title,
      slug: body.slug,
      status: body.status,
      user_id: body.user_id,
      category_id: body.category_id,
      tags_count: body.tags?.length || 0,
      content_length: body.content?.length || 0,
    })

    // Validate required fields
    if (!body.title || !body.content || !body.user_id) {
      console.error("[API] POST /api/posts - Missing required fields")
      return NextResponse.json({ error: "Missing required fields: title, content, or user_id" }, { status: 400 })
    }

    // Check if user exists and is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[API] POST /api/posts - Authentication failed:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (user.id !== body.user_id) {
      console.error("[API] POST /api/posts - User ID mismatch")
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 })
    }

    console.log(`[API] POST /api/posts - User authenticated: ${user.id}`)

    // Ensure slug is unique
    let finalSlug = body.slug
    let counter = 1

    while (true) {
      const { data: existingPost } = await supabase.from("posts").select("id").eq("slug", finalSlug).single()

      if (!existingPost) break

      finalSlug = `${body.slug}-${counter}`
      counter++
      console.log(`[API] POST /api/posts - Slug conflict, trying: ${finalSlug}`)
    }

    // Prepare post data
    const postData = {
      title: body.title,
      slug: finalSlug,
      content: body.content,
      summary: body.summary || "",
      image_url: body.image_url || null,
      status: body.status,
      published_at: body.published_at || null,
      user_id: body.user_id,
      category_id: body.category_id || null,
    }

    console.log("[API] POST /api/posts - Inserting post")

    // Insert the post
    const { data: newPost, error: postError } = await supabase.from("posts").insert([postData]).select().single()

    if (postError) {
      console.error("[API] POST /api/posts - Error inserting post:", postError)
      return NextResponse.json({ error: postError.message, details: postError }, { status: 500 })
    }

    console.log(`[API] POST /api/posts - Post created successfully with ID: ${newPost.id}`)

    // Handle tags if provided
    if (body.tags && body.tags.length > 0) {
      console.log(`[API] POST /api/posts - Adding ${body.tags.length} tags to post`)

      const tagRelations = body.tags.map((tagId: string) => ({
        post_id: newPost.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("post_tags").insert(tagRelations)

      if (tagsError) {
        console.error("[API] POST /api/posts - Error inserting post tags:", tagsError)
        // Don't fail the entire request, post is already created
        console.warn("[API] POST /api/posts - Post created but tags failed to associate")
      } else {
        console.log(`[API] POST /api/posts - Successfully associated ${body.tags.length} tags`)
      }
    }

    console.log("[API] POST /api/posts - Request completed successfully")
    return NextResponse.json({ data: newPost, error: null })
  } catch (error: any) {
    console.error("[API] POST /api/posts - Unexpected error:", error)
    return NextResponse.json(
      {
        data: null,
        error: error.message || "Failed to create post",
        details: error,
      },
      { status: 500 },
    )
  }
}
