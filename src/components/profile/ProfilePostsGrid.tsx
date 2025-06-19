import Image from "next/image"
import Link from "next/link"
import type { Post } from "@/lib/types"

interface ProfilePostsGridProps {
  posts: Post[]
}

export default function ProfilePostsGrid({ posts }: ProfilePostsGridProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
        <p className="text-gray-500">This author hasn't published any articles yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
        >
          <Link href={`/posts/${post.slug}`}>
            <div className="aspect-video relative overflow-hidden">
              <Image
                src={post.image_url || "/placeholder.svg?height=400&width=800&query=blog post"}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {post.categories && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {post.categories.name}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {post.title}
              </h3>

              <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{post.summary}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>{post.view_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}
