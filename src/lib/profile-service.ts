import { createAdminClient } from "./supabase/admin"
import { createClient } from "./supabase/server"
import type { Profile } from "./types"

export class ProfileService {
  private adminClient
  private readonly serverClient: ReturnType<typeof createClient> | undefined

  constructor() {
    this.adminClient = createAdminClient()
  }

  async updateProfile(profileData: {
    full_name?: string
    bio?: string
    website?: string
    location?: string
    avatar_url?: string | null
    cover_url?: string | null
  }): Promise<Profile> {
    // Get authenticated user from server client
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Authentication required")
    }

    console.log("Updating profile for user:", user.id)
    console.log("Profile data:", profileData)

    // Remove undefined values
    const cleanData = Object.fromEntries(Object.entries(profileData).filter(([_, value]) => value !== undefined))

    // Add updated_at timestamp
    const updateData = {
      ...cleanData,
      updated_at: new Date().toISOString(),
    }

    // Update the profile using admin client for better permissions
    const { data, error } = await this.adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Profile update error:", error)
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    if (!data) {
      throw new Error("No profile data returned after update")
    }

    console.log("Profile updated successfully:", data.id)
    return data as Profile
  }

  async deleteAvatarFile(avatarUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(avatarUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/user-avatars\/(.+)/)

      if (pathMatch) {
        const filePath = pathMatch[1]
        console.log("Deleting avatar file:", filePath)

        const { error: deleteError } = await this.adminClient.storage.from("user-avatars").remove([filePath])

        if (deleteError) {
          console.error("Error deleting avatar file:", deleteError)
          throw new Error(`Failed to delete avatar file: ${deleteError.message}`)
        }

        console.log("Successfully deleted avatar file")
      } else {
        console.log("Could not extract file path from avatar URL:", avatarUrl)
      }
    } catch (error) {
      console.error("Error processing avatar deletion:", error)
      throw error
    }
  }

  async deleteCoverFile(coverUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(coverUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/avatar-cover\/(.+)/)

      if (pathMatch) {
        const filePath = pathMatch[1]
        console.log("Deleting cover file:", filePath)

        const { error: deleteError } = await this.adminClient.storage.from("avatar-cover").remove([filePath])

        if (deleteError) {
          console.error("Error deleting cover file:", deleteError)
          throw new Error(`Failed to delete cover file: ${deleteError.message}`)
        }

        console.log("Successfully deleted cover file")
      } else {
        console.log("Could not extract file path from cover URL:", coverUrl)
      }
    } catch (error) {
      console.error("Error processing cover deletion:", error)
      throw error
    }
  }

  async getProfile(userId?: string): Promise<Profile | null> {
    // If no userId provided, get current user's profile
    if (!userId) {
      const supabase = await createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Authentication required")
      }
      userId = user.id
    }

    const { data, error } = await this.adminClient.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No profile found
        return null
      }
      console.error("Get profile error:", error)
      throw new Error(`Failed to get profile: ${error.message}`)
    }

    return data as Profile
  }
}
