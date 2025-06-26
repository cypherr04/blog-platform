import { createClient } from "@/lib/supabase/server"

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
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth context error:", error)
      return { user: null, error: error.message }
    }

    if (!user) {
      return { user: null, error: "No user found" }
    }

    return {
      user: {
        id: user.id,
        email: user.email || "",
        user_metadata: user.user_metadata,
      },
      error: null,
    }
  } catch (error: any) {
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
