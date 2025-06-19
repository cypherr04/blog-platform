import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Create client with service role key for server-side operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabase
}

export async function getServerUser() {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Create client with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get all cookies
    const allCookies = cookieStore.getAll()

    // Find the main Supabase auth token cookie
    const authCookie = allCookies.find((cookie) => cookie.name.includes("auth-token") && !cookie.name.includes("api"))

    if (!authCookie) {
      console.log("No auth cookie found")
      return { user: null, error: "No auth cookie found" }
    }

    console.log("Found auth cookie:", authCookie.name)

    try {
      // Parse the cookie value as JSON
      const sessionData = JSON.parse(authCookie.value)

      if (sessionData.access_token) {
        // Verify the token with Supabase
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(sessionData.access_token)

        if (user && !userError) {
          console.log("Successfully authenticated user:", user.id)
          return { user, error: null }
        } else {
          console.log("Token verification failed:", userError)
        }
      }
    } catch (parseError) {
      console.log("Error parsing auth cookie:", parseError)
    }

    console.log("No valid session found")
    return { user: null, error: "No valid session found" }
  } catch (error) {
    console.error("Server auth error:", error)
    return { user: null, error: "Authentication failed" }
  }
}
