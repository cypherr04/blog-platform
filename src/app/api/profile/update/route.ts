import { type NextRequest, NextResponse } from "next/server"
import { ProfileService } from "@/lib/profile-service"

interface ProfileUpdateRequest {
  full_name?: string
  bio?: string
  website?: string
  location?: string
  avatar_url?: string | null
  cover_url?: string | null
  delete_old_avatar?: string // URL of old avatar to delete
  delete_old_cover?: string // URL of old cover to delete
}

export async function POST(request: NextRequest) {
  try {
    const profileService = new ProfileService()

    // Parse request body
    const body: ProfileUpdateRequest = await request.json()

    // Validate required fields
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body", success: false }, { status: 400 })
    }

    // Handle old avatar deletion if specified
    if (body.delete_old_avatar) {
      try {
        await profileService.deleteAvatarFile(body.delete_old_avatar)
      } catch (error) {
        console.error("Error deleting old avatar:", error)
        // Continue with profile update even if file deletion fails
      }
    }

    // Handle old cover deletion if specified
    if (body.delete_old_cover) {
      try {
        await profileService.deleteCoverFile(body.delete_old_cover)
      } catch (error) {
        console.error("Error deleting old cover:", error)
        // Continue with profile update even if file deletion fails
      }
    }

    // Prepare profile update data
    const updateData = {
      full_name: body.full_name,
      bio: body.bio,
      website: body.website,
      location: body.location,
      avatar_url: body.avatar_url,
      cover_url: body.cover_url,
    }

    // Update the profile
    const updatedProfile = await profileService.updateProfile(updateData)

    return NextResponse.json({
      data: updatedProfile,
      success: true,
      error: null,
    })
  } catch (error: any) {
    console.error("Profile update API error:", error)

    // Handle authentication errors specifically
    if (error.message?.includes("Authentication") || error.message?.includes("session")) {
      return NextResponse.json(
        {
          error: "Authentication required",
          success: false,
          data: null,
        },
        { status: 401 },
      )
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to update profile",
        success: false,
        data: null,
      },
      { status: 500 },
    )
  }
}
