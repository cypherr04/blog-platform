import ProfileHeader from "./ProfileHeader"
import ProfilePostsGrid from "./ProfilePostsGrid"
import type { Profile, Post } from "@/lib/types"

interface ProfileContentProps {
  profile: Profile
  posts: Post[]
}

export default function ProfileContent({ profile, posts }: ProfileContentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader profile={profile} />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Published Articles ({posts.length})</h2>
          </div>

          <ProfilePostsGrid posts={posts} />
        </div>
      </div>
    </div>
  )
}
