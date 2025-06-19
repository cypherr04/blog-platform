import { PostStatus, type Profile, type Category, type Tag, type Post } from "./types"

export const mockProfiles: Profile[] = [
  {
    id: "user1",
    email: "john.doe@example.com",
    full_name: "John Doe",
    avatar_url: "https://via.placeholder.com/150",
    bio: "Tech enthusiast and content creator",
    website: "https://johndoe.com",
    location: "San Francisco, CA",
    created_at: "2023-01-01T10:00:00Z",
    updated_at: "2023-01-01T10:00:00Z",
    cover_url: null
  },
  {
    id: "user2",
    email: "jane.smith@example.com",
    full_name: "Jane Smith",
    avatar_url: "https://via.placeholder.com/150",
    bio: "Health and wellness blogger",
    website: "https://janesmith.blog",
    location: "New York, NY",
    created_at: "2023-02-15T11:30:00Z",
    updated_at: "2023-02-15T11:30:00Z",
    cover_url: null
  },
]

// Keep backward compatibility
export const mockUsers = mockProfiles

export const mockCategories: Category[] = [
  {
    id: "cat1",
    name: "Technology",
    slug: "technology",
  },
  {
    id: "cat2",
    name: "Science",
    slug: "science",
  },
  {
    id: "cat3",
    name: "Lifestyle",
    slug: "lifestyle",
  },
]

export const mockTags: Tag[] = [
  {
    id: "tag1",
    name: "AI",
    slug: "ai",
  },
  {
    id: "tag2",
    name: "Web Development",
    slug: "web-development",
  },
  {
    id: "tag3",
    name: "Health",
    slug: "health",
  },
]

export const mockPosts: Post[] = [
  {
    id: "post1",
    user_id: "user1",
    title: "The Future of AI in Content Creation",
    slug: "future-of-ai",
    content:
      "<p>Artificial intelligence is rapidly transforming various industries, and content creation is no exception...</p>",
    summary: "An in-depth look at how AI is revolutionizing the way we create content.",
    image_url: "https://via.placeholder.com/800x400",
    status: PostStatus.PUBLISHED,
    created_at: "2023-03-10T09:00:00Z",
    updated_at: "2023-03-10T09:00:00Z",
    published_at: "2023-03-10T09:00:00Z",
    category_id: "cat1",
    view_count: 150,
    tags: ["tag1", "tag2"], // Add tags array
  },
  {
    id: "post2",
    user_id: "user2",
    title: "10 Tips for a Healthier Lifestyle",
    slug: "healthier-lifestyle",
    content: "<p>Adopting a healthier lifestyle doesn't have to be difficult. Here are 10 simple tips...</p>",
    summary: "Simple yet effective tips to improve your overall well-being.",
    image_url: "https://via.placeholder.com/800x400",
    status: PostStatus.PUBLISHED,
    created_at: "2023-03-15T14:00:00Z",
    updated_at: "2023-03-15T14:00:00Z",
    published_at: "2023-03-15T14:00:00Z",
    category_id: "cat3",
    view_count: 89,
    tags: ["tag3"], // Add tags array
  },
  {
    id: "post3",
    user_id: "user1",
    title: "Understanding Quantum Physics for Beginners",
    slug: "quantum-physics-beginners",
    content: "<p>Quantum physics can seem daunting, but its fundamental principles are fascinating...</p>",
    summary: "A simplified guide to the complex world of quantum mechanics.",
    image_url: "https://via.placeholder.com/800x400",
    status: PostStatus.DRAFT,
    created_at: "2023-03-20T10:00:00Z",
    updated_at: "2023-03-20T10:00:00Z",
    published_at: null,
    category_id: "cat2",
    view_count: 0,
    tags: ["tag1"], // Add tags array
  },
]
