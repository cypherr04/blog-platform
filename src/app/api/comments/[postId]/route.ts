import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const supabase = await createClient()
    const { postId } = params

    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: comments || [],
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const { postId } = params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data: comment, error: insertError } = await adminSupabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        },
      ])
      .select(`
        id,
        content,
        created_at,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      throw insertError
    }

    return NextResponse.json({
      success: true,
      data: comment,
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
