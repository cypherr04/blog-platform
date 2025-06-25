"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Post as PostType, Category as CategoryType, Comment } from "./types"

const supabase = createClient()

export type Profile = {
  id: string
  updated_at?: string
  username?: string
  full_name?: string
  avatar_url?: string
  cover_url?: string
  website?: string
  bio?: string
  location?: string
  email?: string
}

export type Post = {
  id: string
  created_at?: string
  user_id: string
  title: string
  slug: string
  content: string
  summary: string
  image_url: string
  status: string
  published_at?: string
  category_id: string
  view_count?: number
  tags: string[]
  profiles?: Profile
  categories?: CategoryType
}

export type Category = {
  id: string
  created_at?: string
  name: string
  slug: string
}

export type CreatePostData = {
  user_id: string
  title: string
  slug: string
  content: string
  summary: string
  image_url: string
  status: string
  published_at?: string
  category_id: string
  tags: string[]
}

export type UpdatePostData = {
  title: string
  slug: string
  content: string
  summary: string
  image_url: string
  status: string
  published_at?: string
  category_id: string
  tags: string[]
}

export type UpdateProfileData = {
  full_name: string
  avatar_url: string
  bio: string
  website: string
  location: string
}

// Helper function to create a user profile
export async function createUserProfile(userId: string, userData: any): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name: userData?.full_name || userData?.user_metadata?.full_name || "",
          avatar_url: userData?.avatar_url || userData?.user_metadata?.avatar_url || "",
          email: userData?.email || "",
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

// Helper function to get user profile
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

// Helper function to ensure user profile exists
export async function ensureUserProfile(user: User): Promise<Profile | null> {
  if (!user) return null

  try {
    // Check if profile exists
    const profile = await getUserProfile(user.id)

    // If profile doesn't exist, create it
    if (!profile) {
      return await createUserProfile(user.id, user)
    }

    return profile
  } catch (error) {
    console.error("Error ensuring user profile:", error)
    throw error
  }
}

// Posts
export async function getPosts(limit = 10, status = "PUBLISHED") {
  console.log(`[supabaseHelpers] Getting posts: limit=${limit}, status=${status}`)

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq("status", status)
      .order("published_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[supabaseHelpers] Error fetching posts:", error)
      throw error
    }

    console.log(`[supabaseHelpers] Successfully fetched ${data?.length || 0} posts`)
    return data
  } catch (error) {
    console.error("[supabaseHelpers] getPosts failed:", error)
    throw error
  }
}

export async function createPost(post: Omit<PostType, "id" | "created_at" | "updated_at">) {
  console.log("[supabaseHelpers] Creating post:", {
    title: post.title,
    slug: post.slug,
    status: post.status,
    user_id: post.user_id,
    category_id: post.category_id,
    tags_count: post.tags?.length || 0,
    content_length: post.content?.length || 0,
  })

  try {
    // Validate required fields
    if (!post.title || !post.content || !post.user_id) {
      throw new Error("Missing required fields: title, content, or user_id")
    }

    // Ensure slug is unique
    let finalSlug = post.slug
    let counter = 1

    while (true) {
      const { data: existingPost } = await supabase.from("posts").select("id").eq("slug", finalSlug).single()

      if (!existingPost) break

      finalSlug = `${post.slug}-${counter}`
      counter++
      console.log(`[supabaseHelpers] Slug conflict, trying: ${finalSlug}`)
    }

    // Prepare post data
    const postData = {
      title: post.title,
      slug: finalSlug,
      content: post.content,
      summary: post.summary || "",
      image_url: post.image_url || null,
      status: post.status,
      published_at: post.published_at || null,
      user_id: post.user_id,
      category_id: post.category_id || null,
    }

    console.log("[supabaseHelpers] Inserting post with data:", {
      ...postData,
      content: `${postData.content.substring(0, 100)}...`,
    })

    // Insert the post
    const { data: newPost, error: postError } = await supabase.from("posts").insert([postData]).select().single()

    if (postError) {
      console.error("[supabaseHelpers] Error inserting post:", postError)
      throw postError
    }

    console.log(`[supabaseHelpers] Post created successfully with ID: ${newPost.id}`)

    // Handle tags if provided
    if (post.tags && post.tags.length > 0) {
      console.log(`[supabaseHelpers] Adding ${post.tags.length} tags to post`)

      const tagRelations = post.tags.map((tagId) => ({
        post_id: newPost.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("post_tags").insert(tagRelations)

      if (tagsError) {
        console.error("[supabaseHelpers] Error inserting post tags:", tagsError)
        // Don't throw here, post is already created
        console.warn("[supabaseHelpers] Post created but tags failed to associate")
      } else {
        console.log(`[supabaseHelpers] Successfully associated ${post.tags.length} tags`)
      }
    }

    return newPost
  } catch (error) {
    console.error("[supabaseHelpers] createPost failed:", error)
    throw error
  }
}

export async function getPostBySlug(slug: string) {
  console.log(`[supabaseHelpers] Getting post by slug: ${slug}`)

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          email
        ),
        categories:category_id (
          id,
          name,
          slug
        ),
        post_tags (
          tags (
            id,
            name,
            slug
          )
        )
      `)
      .eq("slug", slug)
      .single()

    if (error) {
      console.error("[supabaseHelpers] Error fetching post by slug:", error)
      throw error
    }

    console.log(`[supabaseHelpers] Successfully fetched post: ${data.title}`)
    return data
  } catch (error) {
    console.error("[supabaseHelpers] getPostBySlug failed:", error)
    throw error
  }
}

// Categories
export async function getCategories() {
  console.log("[supabaseHelpers] Getting categories")

  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("[supabaseHelpers] Error fetching categories:", error)
      throw error
    }

    console.log(`[supabaseHelpers] Successfully fetched ${data?.length || 0} categories`)
    return data
  } catch (error) {
    console.error("[supabaseHelpers] getCategories failed:", error)
    throw error
  }
}

// Tags
export async function getTags() {
  console.log("[supabaseHelpers] Getting tags")

  try {
    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) {
      console.error("[supabaseHelpers] Error fetching tags:", error)
      throw error
    }

    console.log(`[supabaseHelpers] Successfully fetched ${data?.length || 0} tags`)
    return data
  } catch (error) {
    console.error("[supabaseHelpers] getTags failed:", error)
    throw error
  }
}

// Comments
export async function getCommentsByPostId(postId: string) {
  console.log(`[supabaseHelpers] Getting comments for post: ${postId}`)

  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[supabaseHelpers] Error fetching comments:", error)
      throw error
    }

    console.log(`[supabaseHelpers] Successfully fetched ${data?.length || 0} comments`)
    return data
  } catch (error) {
    console.error("[supabaseHelpers] getCommentsByPostId failed:", error)
    throw error
  }
}

export async function createComment(comment: Omit<Comment, "id" | "created_at" | "updated_at">) {
  console.log("[supabaseHelpers] Creating comment for post:", comment.post_id)

  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([comment])
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error("[supabaseHelpers] Error creating comment:", error)
      throw error
    }

    console.log(`[supabaseHelpers] Comment created successfully with ID: ${data.id}`)
    return data
  } catch (error) {
    console.error("[supabaseHelpers] createComment failed:", error)
    throw error
  }
}

// Helper function to get posts by user
export async function getUserPosts(userId: string) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (*),
        categories:category_id (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    const postsWithTags = (data || []).map((post) => ({ ...post, tags: [] }))
    return postsWithTags
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return []
  }
}

// Helper function to get a post by ID
export async function getPostById(postId: string) {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (*),
        categories:category_id (*)
      `)
      .eq("id", postId)
      .single()

    if (error) throw error

    const { data: postTags } = await supabase
      .from("post_tags")
      .select(`
        tags:tag_id (
          id,
          name,
          slug
        )
      `)
      .eq("post_id", postId)

    const tags: string[] = []
    if (postTags && Array.isArray(postTags)) {
      postTags.forEach((postTag: any) => {
        if (postTag && typeof postTag === "object" && postTag.tags) {
          if (typeof postTag.tags === "object" && postTag.tags.id) {
            tags.push(postTag.tags.id)
          }
        }
      })
    }

    return { ...data, tags }
  } catch (error) {
    console.error("Error fetching post:", error)
    throw error
  }
}

// Helper function to update a post
export async function updatePost(postId: string, postData: UpdatePostData): Promise<Post> {
  try {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .update({
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        summary: postData.summary,
        image_url: postData.image_url,
        status: postData.status,
        published_at: postData.published_at,
        category_id: postData.category_id,
      })
      .eq("id", postId)
      .select()
      .single()

    if (postError) throw postError

    if (postData.tags && post) {
      const { error: deleteError } = await supabase.from("post_tags").delete().eq("post_id", postId)
      if (deleteError) throw deleteError

      if (postData.tags.length > 0) {
        const postTagsData = postData.tags.map((tagId: string) => ({
          post_id: postId,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabase.from("post_tags").insert(postTagsData)
        if (tagsError) throw tagsError
      }
    }

    return { ...post, tags: postData.tags || [] }
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

// Helper function to delete a post
export async function deletePost(postId: string) {
  try {
    const { error: tagsError } = await supabase.from("post_tags").delete().eq("post_id", postId)
    if (tagsError) throw tagsError

    const { error: postError } = await supabase.from("posts").delete().eq("id", postId)
    if (postError) throw postError

    return true
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

// Helper function to update user profile
export async function updateUserProfile(userId: string, profileData: UpdateProfileData): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        bio: profileData.bio,
        website: profileData.website,
        location: profileData.location,
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Custom hook to handle authentication state - FIXED VERSION
export function useAuth(): {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Memoized function to refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      try {
        const updatedProfile = await getUserProfile(user.id)
        setProfile(updatedProfile)
      } catch (error) {
        console.error("Error refreshing profile:", error)
      }
    }
  }, [user])

  useEffect(() => {
    let mounted = true

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setUser(session?.user || null)

      if (session?.user) {
        try {
          const profile = await ensureUserProfile(session.user)
          if (mounted) {
            setProfile(profile)
          }
        } catch (error) {
          console.error("Error in auth state change:", error)
        }
      } else {
        setProfile(null)
      }

      if (mounted) {
        setLoading(false)
      }
    })

    // Initial session check
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        setUser(session?.user || null)

        if (session?.user) {
          try {
            const profile = await ensureUserProfile(session.user)
            if (mounted) {
              setProfile(profile)
            }
          } catch (error) {
            console.error("Error in initial auth check:", error)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // REMOVED [user] dependency to prevent infinite loop

  return { user, profile, loading, refreshProfile }
}
