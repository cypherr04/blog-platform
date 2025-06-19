import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// GET comments for a post
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
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

// POST new comment
export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Get cookies
    const cookieStore = await cookies()

    // Create Supabase client for auth verification
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const authSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get authorization header
    const authHeader = request.headers.get("authorization")
    let accessToken = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7)
    } else {
      // Try to get from cookies - check all possible cookie names
      const allCookies = cookieStore.getAll()
      console.log(
        "All cookies:",
        allCookies.map((c) => ({ name: c.name, hasValue: !!c.value })),
      )

      // Common Supabase cookie patterns
      const possibleAuthCookies = allCookies.filter(
        (cookie) =>
          cookie.name.includes("supabase") ||
          cookie.name.includes("sb-") ||
          cookie.name.includes("auth") ||
          cookie.name.includes("session") ||
          cookie.name.includes("access"),
      )

      console.log(
        "Possible auth cookies:",
        possibleAuthCookies.map((c) => c.name),
      )

      for (const cookie of possibleAuthCookies) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(cookie.value)
          if (parsed.access_token) {
            accessToken = parsed.access_token
            break
          }
        } catch {
          // If not JSON, might be direct token
          if (cookie.value && cookie.value.length > 20) {
            accessToken = cookie.value
            break
          }
        }
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 401 })
    }

    // Verify the user with the access token
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    // Create server Supabase client for database operations
    const serverSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Insert comment using the server client
    const { data: comment, error: insertError } = await serverSupabase
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
