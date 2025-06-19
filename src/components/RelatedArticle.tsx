import Image from "next/image"
import Link from "next/link"
import type { PostSummary } from "@/lib/types"

interface RelatedArticleProps {
  post: PostSummary
}

export default function RelatedArticle({ post }: RelatedArticleProps) {
  // Extract author name from profiles array
  const authorName = post.profiles && post.profiles.length > 0 ? post.profiles[0].full_name : "Anonymous"

  return (
    <Link href={`/posts/${post.slug}`} className="block mb-4 group">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <Image
            src={post.image_url || "/placeholder.svg?height=60&width=80"}
            alt={post.title}
            width={80}
            height={60}
            className="rounded-lg object-cover group-hover:opacity-80 transition-opacity"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h4>
          <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>{post.view_count || 0} views</span>
          </div>
          {authorName && <p className="text-xs text-gray-400 mt-1">by {authorName}</p>}
        </div>
      </div>
    </Link>
  )
}
