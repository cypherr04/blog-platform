"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PostStatus } from "@/lib/types"
import { getCategories, getTags } from "@/lib/supabaseHelpers"
import { supabase } from "@/lib/supabaseClient"
import type { ImageProcessingResult } from "@/lib/imageUtils"
import { Button } from "@/components/ui/button"
import { PenTool, Bot } from "lucide-react"
import ManualEditor from "@/components/post-editor/ManualEditor"
import AIEditor from "@/components/post-editor/AIEditor"

type EditorMode = "manual" | "ai"

interface GeneratedContent {
  title: string
  summary: string
  content: string
}

export default function CreateNewPostPage() {
  const router = useRouter()
  const [editorMode, setEditorMode] = useState<EditorMode>("manual")

  // Form states
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [category, setCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // AI Editor states
  const [aiTopic, setAiTopic] = useState("")
  const [aiKeywords, setAiKeywords] = useState("")
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Other states
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Featured image states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // State for categories and tags
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setCurrentUser(user)

        const [categoriesData, tagsData] = await Promise.all([getCategories(), getTags()])
        setCategories(categoriesData || [])
        setTags(tagsData || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleImageSelect = (file: File, metadata: ImageProcessingResult) => {
    setSelectedImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setError(null)
  }

  const handleImageRemove = () => {
    setSelectedImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

  const uploadFeaturedImage = async (userId: string): Promise<string | null> => {
    if (!selectedImageFile) return null

    try {
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)
      const fileExtension = selectedImageFile.name.split(".").pop() || "webp"
      const fileName = `${timestamp}_${randomId}.${fileExtension}`
      const filePath = `post-images/${userId}/${fileName}`

      const { data, error } = await supabase.storage.from("blog-images").upload(filePath, selectedImageFile)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(filePath)

      return publicUrl
    } catch (err: any) {
      throw err
    }
  }

  const handleGenerateContent = async () => {
    if (!aiTopic.trim()) {
      setError("Please enter a topic")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Simulate AI content generation (replace with actual AI API call)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockContent: GeneratedContent = {
        title: `The Future of ${aiTopic} in Modern Business`,
        summary: `Explore how ${aiTopic} is revolutionizing business operations, from automation to decision-making, and what the future holds for companies embracing this technology.`,
        content: `<h2>Introduction</h2><p>${aiTopic} has emerged as one of the most transformative technologies of our time, reshaping industries and redefining how businesses operate.</p><p>From automating routine tasks to providing insights through advanced analytics, ${aiTopic} is enabling companies to achieve unprecedented levels of efficiency and innovation.</p><h2>Key Benefits</h2><p>As we look toward the future, the integration of ${aiTopic} in business processes will only deepen, creating new opportunities and challenges that organizations must navigate.</p><p>Keywords: ${aiKeywords}</p>`,
      }

      setGeneratedContent(mockContent)
    } catch (err: any) {
      setError("Failed to generate content. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditManually = () => {
    if (generatedContent) {
      setTitle(generatedContent.title)
      setSummary(generatedContent.summary)
      setContent(generatedContent.content)
      setEditorMode("manual")
    }
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()

    if (isSaving) return

    setError(null)
    setIsSaving(true)

    try {
      if (!title?.trim()) {
        throw new Error("Title is required")
      }
      if (!content?.trim()) {
        throw new Error("Content is required")
      }
      if (publish && !category) {
        throw new Error("Category is required for publishing")
      }

      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      let featuredImageUrl = null
      if (selectedImageFile) {
        setIsUploading(true)
        try {
          featuredImageUrl = await uploadFeaturedImage(currentUser.id)
        } catch (err: any) {
          console.error("Featured image upload failed:", err.message)
        } finally {
          setIsUploading(false)
        }
      }

      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

      const postData = {
        user_id: currentUser.id,
        title: title.trim(),
        slug,
        content,
        summary: summary.trim(),
        image_url: featuredImageUrl,
        status: publish ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        published_at: publish ? new Date().toISOString() : null,
        category_id: category || null,
        tags: selectedTags,
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      alert(`Post ${publish ? "published" : "saved as draft"} successfully!`)
      router.push("/dashboard/posts")
    } catch (err: any) {
      setError(err.message)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={editorMode === "manual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setEditorMode("manual")}
                className={`flex items-center space-x-2 ${
                  editorMode === "manual"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <PenTool className="h-4 w-4" />
                <span>Manual Editor</span>
              </Button>
              <Button
                variant={editorMode === "ai" ? "default" : "ghost"}
                size="sm"
                onClick={() => setEditorMode("ai")}
                className={`flex items-center space-x-2 ${
                  editorMode === "ai" ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Bot className="h-4 w-4" />
                <span>AI Editor</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={(e) => handleSubmit(e, false)}
                disabled={isSaving || isUploading}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSaving || isUploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
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

        {editorMode === "ai" ? (
          <AIEditor
            aiTopic={aiTopic}
            setAiTopic={setAiTopic}
            aiKeywords={aiKeywords}
            setAiKeywords={setAiKeywords}
            generatedContent={generatedContent}
            isGenerating={isGenerating}
            onGenerateContent={handleGenerateContent}
            onEditManually={handleEditManually}
          />
        ) : (
          <ManualEditor
            title={title}
            setTitle={setTitle}
            summary={summary}
            setSummary={setSummary}
            content={content}
            setContent={setContent}
            category={category}
            setCategory={setCategory}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            categories={categories}
            tags={tags}
            selectedImageFile={selectedImageFile}
            imagePreview={imagePreview}
            isUploading={isUploading}
            isSaving={isSaving}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
          />
        )}
      </div>
    </div>
  )
}
