import { type NextRequest, NextResponse } from "next/server"
import { ProfileService } from "@/lib/profile-service"

export async function GET(request: NextRequest) {
  try {
    const profileService = new ProfileService()
    const profile = await profileService.getProfile()

    return NextResponse.json({
      data: profile,
      success: true,
      error: null,
    })
  } catch (error: any) {
    console.error("Get profile API error:", error)

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
        error: error.message || "Failed to get profile",
        success: false,
        data: null,
      },
      { status: 500 },
    )
  }
}
