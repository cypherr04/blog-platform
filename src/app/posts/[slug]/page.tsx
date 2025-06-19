import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabaseServer"
import RichTextContent from "@/components/RichTextContent"
import TagPill from "@/components/TagPill"
import ReadingProgress from "@/components/ReadingProgress"
import RelatedArticle from "@/components/RelatedArticle"
import CommentSection from "@/components/CommentSection"
import type { Post, Profile, Tag, PostSummary } from "@/lib/types"

async function getPost(slug: string): Promise<{ post: Post; author: Profile; tags: Tag[] } | null> {
  const supabase = await createServerSupabaseClient()

  try {
    // First, get the post to get its ID
    const { data: post, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (*),
        categories:category_id (*)
      `)
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .single()

    if (error || !post) {
      console.error("Error fetching post:", error)
      return null
    }

    console.log("📝 Post found - ID:", post.id, "Current view count:", post.view_count)

    // Increment the view count
    console.log("🔄 Incrementing view count...")
    const { error: incrementError } = await supabase.rpc("increment_post_view_count", {
      post_id: post.id,
    })

    if (incrementError) {
      console.error("❌ Error incrementing view count:", incrementError)
    } else {
      console.log("✅ Successfully incremented view count")
    }

    // Fetch the updated post data
    const { data: updatedPost, error: updateError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (*),
        categories:category_id (*)
      `)
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .single()

    if (updateError || !updatedPost) {
      console.error("Error fetching updated post:", updateError)
      // Return original post if update fetch fails
      console.log("📊 Using original post data - View count:", post.view_count)
    } else {
      console.log("📊 Updated post data - View count:", updatedPost.view_count)
      // Use updated post data
      Object.assign(post, updatedPost)
    }

    // Fetch post tags
    const { data: postTags } = await supabase
      .from("post_tags")
      .select(`
        tags:tag_id (
          id,
          name,
          slug
        )
      `)
      .eq("post_id", post.id)

    // Process tags
    const tags: Tag[] = []
    if (postTags && Array.isArray(postTags)) {
      postTags.forEach((postTag: any) => {
        if (postTag && typeof postTag === "object" && postTag.tags) {
          tags.push(postTag.tags)
        }
      })
    }

    return {
      post: post as Post,
      author: post.profiles as Profile,
      tags,
    }
  } catch (error) {
    console.error("Error in getPost:", error)
    return null
  }
}

async function getRelatedPosts(categoryId: string, currentPostId: string): Promise<PostSummary[]> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: posts } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        summary,
        image_url,
        created_at,
        view_count,
        profiles:user_id (full_name)
      `)
      .eq("category_id", categoryId)
      .eq("status", "PUBLISHED")
      .neq("id", currentPostId)
      .limit(3)

    return (posts || []) as PostSummary[]
  } catch (error) {
    console.error("Error fetching related posts:", error)
    return []
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  console.log("🚀 Loading post page for slug:", params.slug)

  const data = await getPost(params.slug)

  if (!data) {
    console.log("❌ Post not found, showing 404")
    notFound()
  }

  const { post, author, tags } = data

  console.log("🎯 Final post data - ID:", post.id, "View Count:", post.view_count)

  // Get related posts
  const relatedPosts = post.category_id ? await getRelatedPosts(post.category_id, post.id) : []

  const authorName = author?.full_name || "Anonymous"
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] bg-gradient-to-r from-blue-600 to-purple-700">
        {post.image_url && (
          <Image
            src={post.image_url || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover mix-blend-overlay opacity-30"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">{post.title}</h1>
            {post.summary && <p className="text-xl text-gray-200 mb-8 max-w-3xl">{post.summary}</p>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          {/* Main Article */}
          <article className="lg:w-2/3">
            {/* Author Info */}
            <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
              {author?.avatar_url ? (
                <Image
                  src={author.avatar_url || "/placeholder.svg"}
                  alt={authorName}
                  width={60}
                  height={60}
                  className="rounded-full mr-4"
                />
              ) : (
                <div className="w-15 h-15 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                  <span className="text-gray-600 font-medium text-xl">{authorName.charAt(0)}</span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{authorName}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <span>{publishedDate}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    {post.view_count || 0} views
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="mb-12">
              <RichTextContent content={post.content} />
            </div>

            {/* Author Bio */}
            {author && (
              <div className="bg-gray-50 rounded-xl p-8 mb-12">
                <div className="flex items-start">
                  {author.avatar_url ? (
                    <Image
                      src={author.avatar_url || "/placeholder.svg"}
                      alt={authorName}
                      width={80}
                      height={80}
                      className="rounded-full mr-6"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center mr-6">
                      <span className="text-gray-600 font-medium text-2xl">{authorName.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">About {authorName}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {author.bio ||
                        `${authorName} is a contributor to this blog platform, sharing insights and expertise on various topics.`}
                    </p>
                    {author.website && (
                      <a
                        href={author.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Visit Website
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <CommentSection postId={post.id} />
          </article>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-8 space-y-8">
              {/* Reading Progress */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <ReadingProgress />
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap">
                    {tags.map((tag) => (
                      <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
                    ))}
                  </div>
                </div>
              )}

              {/* Archive */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Archive</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                      December 2024
                    </Link>
                    <span className="text-sm text-gray-400">(12)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                      November 2024
                    </Link>
                    <span className="text-sm text-gray-400">(8)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                      October 2024
                    </Link>
                    <span className="text-sm text-gray-400">(15)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                      September 2024
                    </Link>
                    <span className="text-sm text-gray-400">(7)</span>
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <RelatedArticle key={relatedPost.id} post={relatedPost} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
