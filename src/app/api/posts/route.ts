import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a server-side Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") || "6"
    const status = searchParams.get("status") || "PUBLISHED"

    console.log("Fetching posts with limit:", limit, "status:", status)

    // Try to fetch posts with profiles join first
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
      console.warn("Error fetching posts with profiles, trying without profiles:", profileError)

      // Fallback: fetch posts without profiles join
      const { data: postsOnly, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("status", status)
        .order("published_at", { ascending: false })
        .limit(Number.parseInt(limit))

      if (postsError) {
        console.error("Error fetching posts:", postsError)
        throw postsError
      }

      console.log("Successfully fetched posts without profiles:", postsOnly?.length || 0)
      return NextResponse.json({ data: postsOnly || [], error: null })
    }

    console.log("Successfully fetched posts with profiles:", postsWithProfiles?.length || 0)
    return NextResponse.json({ data: postsWithProfiles || [], error: null })
  } catch (error: any) {
    console.error("API Error fetching posts:", error)
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
