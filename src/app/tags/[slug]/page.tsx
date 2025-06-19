import { mockPosts, mockTags, mockProfiles } from "@/lib/mockData"
import type { Post } from "@/lib/types"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function TagPostsPage({ params }: { params: { slug: string } }) {
  const tag = mockTags.find((t) => t.slug === params.slug)

  if (!tag) {
    notFound()
  }

  const filteredPosts = mockPosts.filter((post) => post.tags.includes(tag.id) && post.status === "PUBLISHED")

  const getAuthorName = (userId: string) => {
    const author = mockProfiles.find((profile) => profile.id === userId)
    return author ? author.full_name || "Unknown Author" : "Unknown Author"
  }

  return (
    <section className="py-12">
      <h2 className="text-4xl font-bold mb-8 text-center">Articles tagged with "{tag.name}"</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post: Post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6 text-left">
              {post.image_url && (
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="rounded-md mb-4"
                />
              )}
              <h4 className="text-xl font-bold mb-2">
                <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </h4>
              <p className="text-gray-700 mb-3">{post.summary}</p>
              <p className="text-sm text-gray-500">
                By {getAuthorName(post.user_id)} on {new Date(post.published_at!).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">No articles found with this tag.</p>
        )}
      </div>
    </section>
  )
}
