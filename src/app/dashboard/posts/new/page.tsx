"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PostStatus } from "@/lib/types"
import { getCategories, getTags } from "@/lib/supabaseHelpers"
import { supabase } from "@/lib/supabaseClient"
import RichTextEditor from "@/components/RichTextEditor"
import ImageUpload from "@/components/imageUpload"
import type { ImageProcessingResult } from "@/lib/imageUtils"

export default function CreateNewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Featured image states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // State for categories and tags
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  // Debug state
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `${timestamp}: ${info}`
    console.log(`[DEBUG] ${logEntry}`)
    setDebugInfo((prev) => [...prev.slice(-15), logEntry])
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        addDebugInfo("Fetching initial data...")

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setCurrentUser(user)
        addDebugInfo(`User: ${user.id}`)

        const [categoriesData, tagsData] = await Promise.all([getCategories(), getTags()])
        setCategories(categoriesData || [])
        setTags(tagsData || [])
        addDebugInfo(`Loaded ${categoriesData?.length || 0} categories, ${tagsData?.length || 0} tags`)
      } catch (err: any) {
        addDebugInfo(`Error: ${err.message}`)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId) ? prevTags.filter((id) => id !== tagId) : [...prevTags, tagId],
    )
  }

  const handleImageSelect = (file: File, metadata: ImageProcessingResult) => {
    setSelectedImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setError(null)
    addDebugInfo(`Featured image selected: ${file.name}`)
  }

  const handleImageRemove = () => {
    setSelectedImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
    addDebugInfo("Featured image removed")
  }

  // Simple featured image upload that won't hang
  const uploadFeaturedImage = async (userId: string): Promise<string | null> => {
    if (!selectedImageFile) return null

    try {
      addDebugInfo("Starting featured image upload...")

      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)
      const fileExtension = selectedImageFile.name.split(".").pop() || "webp"
      const fileName = `${timestamp}_${randomId}.${fileExtension}`
      const filePath = `post-images/${userId}/${fileName}` // Fixed path structure

      addDebugInfo(`Uploading to: ${filePath}`)

      // Simple upload - no progress tracking
      const { data, error } = await supabase.storage.from("blog-images").upload(filePath, selectedImageFile)

      if (error) {
        addDebugInfo(`Upload error: ${error.message}`)
        throw error
      }

      addDebugInfo(`Upload successful: ${data.path}`)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(filePath)

      addDebugInfo(`Public URL: ${publicUrl}`)
      return publicUrl
    } catch (err: any) {
      addDebugInfo(`Upload failed: ${err.message}`)
      throw err
    }
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()

    if (isSaving) {
      addDebugInfo("Already saving, ignoring duplicate submission")
      return
    }

    addDebugInfo(`=== STARTING ${publish ? "PUBLISH" : "DRAFT"} ===`)
    setError(null)
    setIsSaving(true)

    try {
      // Basic validation
      if (!title?.trim()) {
        throw new Error("Title is required")
      }
      if (!content?.trim()) {
        throw new Error("Content is required")
      }
      if (publish && !category) {
        throw new Error("Category is required for publishing")
      }

      addDebugInfo("Validation passed")

      // Get user
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      addDebugInfo(`User confirmed: ${currentUser.id}`)

      // Upload featured image if exists
      let featuredImageUrl = null
      if (selectedImageFile) {
        addDebugInfo("Uploading featured image...")
        setIsUploading(true)
        try {
          featuredImageUrl = await uploadFeaturedImage(currentUser.id)
          addDebugInfo("Featured image uploaded successfully")
        } catch (err: any) {
          addDebugInfo(`Featured image upload failed: ${err.message}`)
          // Don't fail the entire post - just continue without featured image
          addDebugInfo("Continuing without featured image...")
        } finally {
          setIsUploading(false)
        }
      }

      // Create slug
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

      // Prepare post data
      const postData = {
        user_id: currentUser.id,
        title: title.trim(),
        slug,
        content,
        summary: summary.trim(),
        image_url: featuredImageUrl, // Use uploaded image URL
        status: publish ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        published_at: publish ? new Date().toISOString() : null,
        category_id: category || null,
        tags: selectedTags,
      }

      addDebugInfo("POST DATA PREPARED - MAKING API CALL NOW...")
      addDebugInfo(`API URL: /api/posts`)
      addDebugInfo(`Method: POST`)
      addDebugInfo(`Data: ${JSON.stringify(postData, null, 2)}`)

      // Make API call
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      addDebugInfo(`API RESPONSE RECEIVED: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        addDebugInfo(`API ERROR RESPONSE: ${errorText}`)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      addDebugInfo(`API SUCCESS: ${JSON.stringify(result)}`)
      addDebugInfo(`Post created with ID: ${result.data?.id}`)

      alert(`Post ${publish ? "published" : "saved as draft"} successfully!`)
      router.push("/dashboard/posts")
    } catch (err: any) {
      addDebugInfo(`ERROR: ${err.message}`)
      addDebugInfo(`ERROR STACK: ${err.stack}`)
      setError(err.message)
    } finally {
      setIsSaving(false)
      addDebugInfo("=== SUBMISSION ENDED ===")
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
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="mt-2 text-gray-600">Share your thoughts with the world.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-6">
            {/* Simple Debug Panel */}
            <div className="bg-gray-100 p-3 rounded-md">
              <details>
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Debug ({debugInfo.length}) - {isSaving ? "SAVING..." : "Ready"}
                </summary>
                <div className="mt-2 text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div key={index} className={info.includes("ERROR") ? "text-red-600" : ""}>
                      {info}
                    </div>
                  ))}
                </div>
              </details>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
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
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <div className="min-h-[400px]">
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </div>

            {/* Featured Image */}
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

              {isUploading && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center text-sm text-blue-800">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="font-medium">Uploading featured image...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
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
                          className="inline-flex items-center text-black bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                        >
                          <input
                            type="checkbox"
                            value={tag.id}
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => handleTagChange(tag.id)}
                            className="form-checkbox h-4 w-4 text-blue-600 mr-2 focus:ring-blue-500"
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
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
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
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSaving || isUploading}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isSaving || isUploading}
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
