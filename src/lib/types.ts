// Profile type based on the profiles table in Supabase
export type Profile = {
  id: string // UUID, references auth.users.id
  email: string
  full_name: string | null
  avatar_url: string | null
  cover_url: string | null
  bio: string | null
  website: string | null
  location: string | null
  created_at: string // timestamptz
  updated_at: string // timestamptz
}

// Keep User type for backward compatibility, but it should reference Profile
export type User = Profile

export type Category = {
  id: string // UUID
  name: string
  slug: string
}

export type CategoryWithCount = Category & {
  post_count: number
}

export type Tag = {
  id: string // UUID
  name: string
  slug: string
}

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export type Post = {
  id: string // UUID
  user_id: string // UUID, references profiles.id
  title: string
  slug: string
  content: string
  summary: string
  image_url: string | null
  status: PostStatus
  created_at: string // timestamptz
  updated_at: string // timestamptz
  published_at: string | null // timestamptz
  category_id: string | null // UUID, references categories.id
  view_count?: number // Optional field for view tracking
  tags: string[] // Array of tag IDs for the post

  // Relationship fields (populated by joins)
  profiles?: Profile
  categories?: Category
  post_tags?: PostTag[]
}

// Simplified post type for homepage/listing views
export type PostSummary = {
  id: string
  title: string
  slug: string
  summary: string
  image_url: string | null
  created_at: string
  view_count: number
  profiles: {
    full_name: string | null
  }[]
}

// Junction table for many-to-many relationship between posts and tags
export type PostTag = {
  post_id: string // UUID
  tag_id: string // UUID
  tags?: Tag // Populated by join
}

export type Comment = {
  id: string // UUID
  post_id: string // UUID, references posts.id
  user_id: string // UUID, references profiles.id
  content: string
  created_at: string // timestamptz
  updated_at: string // timestamptz

  // Relationship fields
  profiles?: Profile
  posts?: Post
}

export type Like = {
  id: string // UUID
  post_id: string // UUID, references posts.id
  user_id: string // UUID, references profiles.id
  created_at: string // timestamptz

  // Relationship fields
  profiles?: Profile
  posts?: Post
}

// API Response types
export type ApiResponse<T> = {
  data: T | null
  error: string | null
  success: boolean
}

// Form data types
export type CreatePostData = {
  user_id: string // Add missing user_id property
  title: string
  slug: string
  content: string
  summary: string
  image_url?: string | null
  status: PostStatus
  published_at?: string | null
  category_id?: string | null
  tags: string[]
}

export type UpdatePostData = Partial<CreatePostData>

export type UpdateProfileData = {
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
  website?: string | null
  location?: string | null
}
