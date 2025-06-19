"use client"

import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import type { Profile, Post, CreatePostData, UpdatePostData, UpdateProfileData } from "./types"

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
      .single() // Return single profile instead of array

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
export async function ensureUserProfile(user: any): Promise<Profile | null> {
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

// Helper function to get categories
export async function getCategories() {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

// Helper function to get tags
export async function getTags() {
  try {
    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching tags:", error)
    return []
  }
}

// Helper function to get a post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (*),
        categories:category_id (*)
      `)
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // No rows returned
      }
      throw error
    }

    // Fetch post tags with proper type handling
    const { data: postTags } = await supabase
      .from("post_tags")
      .select(`
        tags:tag_id (
          id,
          name,
          slug
        )
      `)
      .eq("post_id", data.id)

    // Add tags to post data - fix the type issue
    const tags: string[] = []
    if (postTags && Array.isArray(postTags)) {
      postTags.forEach((postTag: any) => {
        // Handle the nested tags structure properly
        if (postTag && typeof postTag === "object" && postTag.tags) {
          if (typeof postTag.tags === "object" && postTag.tags.id) {
            tags.push(postTag.tags.id)
          }
        }
      })
    }

    return { ...data, tags }
  } catch (error) {
    console.error("Error fetching post by slug:", error)
    throw error
  }
}

// Helper function to create a post
export async function createPost(postData: CreatePostData): Promise<Post> {
  try {
    // First, insert the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert([
        {
          user_id: postData.user_id,
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          summary: postData.summary,
          image_url: postData.image_url,
          status: postData.status,
          published_at: postData.published_at,
          category_id: postData.category_id,
        },
      ])
      .select()
      .single()

    if (postError) throw postError

    // If tags are provided, create post_tags relationships
    if (postData.tags && postData.tags.length > 0 && post) {
      const postTagsData = postData.tags.map((tagId: string) => ({
        post_id: post.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("post_tags").insert(postTagsData)

      if (tagsError) throw tagsError
    }

    // Add tags array to the returned post
    return { ...post, tags: postData.tags }
  } catch (error) {
    console.error("Error creating post:", error)
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

    // Add empty tags array to each post for consistency
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

    // Fetch post tags separately
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

    // Add tags to post data
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
    // Update the post
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

    // If tags are provided, update post_tags relationships
    if (postData.tags && post) {
      // First, delete existing relationships
      const { error: deleteError } = await supabase.from("post_tags").delete().eq("post_id", postId)

      if (deleteError) throw deleteError

      // Then, insert new relationships
      if (postData.tags.length > 0) {
        const postTagsData = postData.tags.map((tagId: string) => ({
          post_id: postId,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabase.from("post_tags").insert(postTagsData)

        if (tagsError) throw tagsError
      }
    }

    // Add tags array to the returned post
    return { ...post, tags: postData.tags || [] }
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

// Helper function to delete a post
export async function deletePost(postId: string) {
  try {
    // First, delete post_tags relationships
    const { error: tagsError } = await supabase.from("post_tags").delete().eq("post_id", postId)

    if (tagsError) throw tagsError

    // Then, delete the post
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
      .single() // Return single profile instead of array

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Custom hook to handle authentication state
export function useAuth(): { user: any; profile: Profile | null; loading: boolean } {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        try {
          const profile = await ensureUserProfile(session.user)
          setProfile(profile)
        } catch (error) {
          console.error("Error in auth state change:", error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    // Initial session check
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user || null)

      if (session?.user) {
        try {
          const profile = await ensureUserProfile(session.user)
          setProfile(profile)
        } catch (error) {
          console.error("Error in initial auth check:", error)
        }
      }

      setLoading(false)
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, profile, loading }
}
