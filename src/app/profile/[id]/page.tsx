import { notFound } from "next/navigation"
import ProfileContent from "@/components/profile/ProfileContent"
import type { Profile, Post } from "@/lib/types"

interface ProfilePageProps {
  params: {
    id: string
  }
}

async function getProfileData(id: string): Promise<{ profile: Profile; posts: Post[] } | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/profile/${id}`, {
      cache: "no-store", // Ensure fresh data on each request
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching profile data:", error)
    return null
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const data = await getProfileData(params.id)

  if (!data) {
    notFound()
  }

  const { profile, posts } = data

  return <ProfileContent profile={profile} posts={posts} />
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const data = await getProfileData(params.id)

  if (!data) {
    return {
      title: "Profile Not Found",
    }
  }

  const { profile } = data

  return {
    title: `${profile.full_name || "Anonymous User"} - Profile`,
    description:
      profile.bio || `View ${profile.full_name || "this user"}'s published articles and profile information.`,
  }
}
