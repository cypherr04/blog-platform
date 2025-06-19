"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { PostStatus } from "@/lib/types"
import { createPost, getCategories, getTags } from "@/lib/supabaseHelpers"
import { supabase } from "@/lib/supabaseClient"
import dynamic from "next/dynamic"
import RichTextEditor from "@/components/RichTextEditor"
import ImageUpload from "@/components/imageUpload"
import type { ImageProcessingResult } from "@/lib/imageUtils"

// Dynamically import the rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-50 animate-pulse rounded-md"></div>,
})

// Import Quill styles
import "react-quill/dist/quill.snow.css"

export default function CreateNewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Enhanced image upload states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageMetadata, setImageMetadata] = useState<ImageProcessingResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // State for categories and tags
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  // Auto-save functionality
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Fetch categories and tags
        const [categoriesData, tagsData] = await Promise.all([getCategories(), getTags()])

        setCategories(categoriesData || [])
        setTags(tagsData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load necessary data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up auto-save timer
    if (autoSaveEnabled) {
      autoSaveTimerRef.current = setInterval(() => {
        if (title && content) {
          handleAutoSave()
        }
      }, 60000) // Auto-save every minute
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [router, autoSaveEnabled])

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId) ? prevTags.filter((id) => id !== tagId) : [...prevTags, tagId],
    )
  }

  // Enhanced image handling
  const handleImageSelect = (file: File, metadata: ImageProcessingResult) => {
    setSelectedImageFile(file)
    setImageMetadata(metadata)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Clear any previous errors
    setError(null)
  }

  const handleImageRemove = () => {
    setSelectedImageFile(null)
    setImageMetadata(null)

    // Clean up preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

  // Enhanced image upload with progress tracking
  const uploadImageToSupabase = async (userId: string): Promise<string | null> => {
    if (!selectedImageFile) return null

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Ensure the storage bucket exists
      await ensureStorageBucket()
      setUploadProgress(20)

      // Create unique file path
      const timestamp = Date.now()
      const fileExtension = selectedImageFile.name.split(".").pop() || "webp"
      const fileName = `${userId}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`
      const filePath = `post-images/${fileName}`

      setUploadProgress(40)

      // Upload to Supabase Storage with progress tracking
      const { data, error } = await supabase.storage.from("blog-images").upload(filePath, selectedImageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: selectedImageFile.type,
      })

      if (error) throw error

      setUploadProgress(80)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(filePath)

      setUploadProgress(100)
      return publicUrl
    } catch (err) {
      console.error("Error uploading image:", err)
      throw err
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // Create storage bucket if it doesn't exist
  const ensureStorageBucket = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket) => bucket.name === "blog-images")

      if (!bucketExists) {
        await supabase.storage.createBucket("blog-images", {
          public: true,
          fileSizeLimit: 10485760, // 10MB in bytes
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        })
      }

      return true
    } catch (error) {
      console.error("Error ensuring storage bucket exists:", error)
      return false
    }
  }

  const handleAutoSave = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-*|-*$/g, "")

      // Create post object
      const newPost = {
        user_id: user.id,
        title,
        slug,
        content,
        summary,
        image_url: imagePreview || "https://via.placeholder.com/800x400",
        status: PostStatus.DRAFT,
        published_at: null, // Always null for auto-save drafts
        category_id: category || null,
        tags: selectedTags,
      }

      // Save post to Supabase
      await createPost(newPost)
      setLastSaved(new Date())
    } catch (err) {
      console.error("Error auto-saving post:", err)
      // Don't show error to user for auto-save
    }
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    setError(null)

    if (!title || !content) {
      setError("Title and Content are required.")
      return
    }

    if (publish && !category) {
      setError("Please select a category before publishing.")
      return
    }

    setIsSaving(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("User not authenticated.")
        return
      }

      // Upload image if provided
      let imageUrl = null
      if (selectedImageFile) {
        try {
          imageUrl = await uploadImageToSupabase(user.id)
        } catch (err: any) {
          setError(`Failed to upload image: ${err.message}`)
          setIsSaving(false)
          return
        }
      }

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-*|-*$/g, "")

      // Create post object
      const newPost = {
        user_id: user.id,
        title,
        slug,
        content,
        summary,
        image_url: imageUrl || imagePreview || "https://via.placeholder.com/800x400",
        status: publish ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        published_at: publish ? new Date().toISOString() : null,
        category_id: category || null,
        tags: selectedTags,
      }

      // Save post to Supabase
      await createPost(newPost)

      alert(`Post ${publish ? "published" : "saved as draft"} successfully.`)
      router.push("/dashboard/posts")
    } catch (err: any) {
      console.error("Error creating post:", err)
      setError(err.message || "Failed to create post. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="mt-2 text-gray-600">Share your thoughts with the world.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form className="p-6 space-y-6">
            {/* Auto-save indicator */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">Auto-save</span>
                </label>
              </div>
              {lastSaved && <span className="text-sm text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</span>}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
                required
                disabled={isSaving}
              />
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                Summary
              </label>
              <textarea
                id="summary"
                rows={3}
                className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief summary of your post"
                disabled={isSaving}
              ></textarea>
            </div>

            {/* Content - Rich Text Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="min-h-[400px]">
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </div>

            {/* Enhanced Featured Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <ImageUpload
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
                currentImage={imagePreview}
                maxSizeKB={500}
                maxWidth={1920}
                maxHeight={1080}
                quality={0.85}
                disabled={isSaving || isUploading}
                className="w-full"
              />

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between text-sm text-blue-800 mb-2">
                    <span className="font-medium">Uploading image...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  className="mt-1 block w-full border border-gray-300 rounded-md text-black shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm max-h-40 overflow-y-auto">
                  {tags.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tags available</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className="inline-flex items-center text-black bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                          <input
                            type="checkbox"
                            value={tag.id}
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => handleTagChange(tag.id)}
                            className="form-checkbox h-4 w-4 text-black mr-2 focus:ring-blue-500"
                            disabled={isSaving}
                          />
                          {tag.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSaving || isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSaving || isUploading}
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSaving || isUploading}
              >
                {isSaving ? "Publishing..." : "Publish"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
