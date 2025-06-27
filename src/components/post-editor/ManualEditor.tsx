"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import RichTextEditor from "@/components/RichTextEditor"
import ImageUpload from "@/components/imageUpload"
import type { ImageProcessingResult } from "@/lib/imageUtils"
import { Bold, Italic, Underline, Heading, Quote, List, ListOrdered, ImageIcon, Code, Link, X } from "lucide-react"

interface ManualEditorProps {
  title: string
  setTitle: (title: string) => void
  summary: string
  setSummary: (summary: string) => void
  content: string
  setContent: (content: string) => void
  category: string
  setCategory: (category: string) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  categories: any[]
  tags: any[]
  selectedImageFile: File | null
  imagePreview: string | null
  isUploading: boolean
  isSaving: boolean
  onImageSelect: (file: File, metadata: ImageProcessingResult) => void
  onImageRemove: () => void
}

export default function ManualEditor({
  title,
  setTitle,
  summary,
  setSummary,
  content,
  setContent,
  category,
  setCategory,
  selectedTags,
  setSelectedTags,
  categories,
  tags,
  selectedImageFile,
  imagePreview,
  isUploading,
  isSaving,
  onImageSelect,
  onImageRemove,
}: ManualEditorProps) {
  const [newTag, setNewTag] = React.useState("")

  const handleTagAdd = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId])
    }
    setNewTag("")
  }

  const handleTagRemove = (tagId: string) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title..."
                className="w-full"
                disabled={isSaving}
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief summary..."
                rows={3}
                className="w-full resize-none"
                disabled={isSaving}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <div className="border border-gray-300 rounded-lg">

                {/* Rich Text Editor */}
                <div className="min-h-[300px]">
                  <RichTextEditor value={content} onChange={setContent} placeholder="Start writing your content..." />
                </div>
              </div>
            </div>

            {/* Category and Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={category} onValueChange={setCategory} disabled={isSaving}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="space-y-2">
                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId)
                        return tag ? (
                          <Badge key={tagId} variant="secondary" className="flex items-center space-x-1">
                            <span>{tag.name}</span>
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tagId)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Tag Input */}
                  <Select value={newTag} onValueChange={handleTagAdd} disabled={isSaving}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Add tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tags
                        .filter((tag) => !selectedTags.includes(tag.id))
                        .map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              <ImageUpload
                onImageSelect={onImageSelect}
                onImageRemove={onImageRemove}
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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
