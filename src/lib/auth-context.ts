import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export interface AuthUser {
  id: string
  email: string
  user_metadata?: any
}

export interface AuthContext {
  user: AuthUser | null
  error: string | null
}

export async function getAuthContext(): Promise<AuthContext> {
  try {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Create client with anon key for auth verification
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get all cookies
    const allCookies = cookieStore.getAll()
    console.log(
      "All cookies:",
      allCookies.map((c) => c.name),
    )

    // Find Supabase auth cookies
    const authCookies = allCookies.filter((cookie) => cookie.name.includes("sb-") && cookie.name.includes("auth-token"))

    console.log(
      "Found auth cookies:",
      authCookies.map((c) => c.name),
    )

    for (const cookie of authCookies) {
      try {
        let sessionData

        // Handle different cookie formats
        if (cookie.value.startsWith("base64-")) {
          // Base64 encoded cookie
          const base64Data = cookie.value.substring(7) // Remove "base64-" prefix
          const decodedData = Buffer.from(base64Data, "base64").toString("utf-8")
          console.log("Decoded cookie data:", decodedData.substring(0, 100) + "...")
          sessionData = JSON.parse(decodedData)
        } else if (cookie.value.startsWith("{")) {
          // JSON cookie
          sessionData = JSON.parse(cookie.value)
        } else {
          // Try as direct token
          sessionData = { access_token: cookie.value }
        }

        if (sessionData.access_token) {
          console.log("Found access token, verifying...")

          // Verify the token with Supabase
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser(sessionData.access_token)

          if (user && !userError) {
            console.log("Successfully authenticated user:", user.id)
            return {
              user: {
                id: user.id,
                email: user.email || "",
                user_metadata: user.user_metadata,
              },
              error: null,
            }
          } else {
            console.log("Token verification failed:", userError?.message)
          }
        }
      } catch (parseError) {
        console.log(`Error parsing cookie ${cookie.name}:`, parseError)
        continue
      }
    }

    console.log("No valid session found in any cookie")
    return { user: null, error: "No valid session found" }
  } catch (error) {
    console.error("Auth context error:", error)
    return { user: null, error: "Authentication failed" }
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const { user, error } = await getAuthContext()

  if (!user || error) {
    throw new Error(error || "Authentication required")
  }

  return user
}
