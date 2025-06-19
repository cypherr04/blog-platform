import Image from "next/image"
import type { Profile } from "@/lib/types"

interface ProfileHeaderProps {
  profile: Profile
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.full_name || "Profile"}
              width={96}
              height={96}
              className="w-24 h-24 object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-2xl font-bold">{profile.full_name?.charAt(0) || "A"}</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name || "Anonymous User"}</h1>

          {profile.bio && <p className="text-gray-600 mb-4 leading-relaxed">{profile.bio}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {profile.location && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{profile.location}</span>
              </div>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-purple-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span>{profile.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}

            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                Joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
