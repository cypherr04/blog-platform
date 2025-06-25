"use client"

import type React from "react"

import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Camera, Loader2, ImageIcon, Trash2 } from "lucide-react"

interface CoverImageSectionProps {
  selectedCover: File | null
  coverMetadata: any
  isUploadingCover: boolean
  coverProgress: number
  profile: any
  coverDeleted: boolean
  isSaving: boolean
  onCoverSelect: (file: File, metadata: any, existingUrl?: string) => void
  onCoverDelete: () => void
}

export function CoverImageSection({
  selectedCover,
  coverMetadata,
  isUploadingCover,
  coverProgress,
  profile,
  coverDeleted,
  isSaving,
  onCoverSelect,
  onCoverDelete,
}: CoverImageSectionProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Process the image like ImageUpload component does
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          // Calculate dimensions
          const maxWidth = 1200
          const maxHeight = 400
          let { width, height } = img

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                  type: "image/webp",
                })

                const metadata = {
                  file: compressedFile,
                  originalSize: file.size,
                  compressedSize: blob.size,
                  compressionRatio: Math.round(((file.size - blob.size) / file.size) * 100),
                  format: "webp",
                  dimensions: { width, height },
                }

                onCoverSelect(compressedFile, metadata, profile?.cover_url || undefined)
              }
            },
            "image/webp",
            0.9,
          )
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    e.target.value = ""
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card">
      {/* Cover Image Preview Area - Clickable */}
      <div
        className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 cursor-pointer group"
        onClick={() => {
          if (!isUploadingCover && !isSaving) {
            document.getElementById("cover-upload-input")?.click()
          }
        }}
      >
        {/* Cover Image */}
        {(selectedCover || (!coverDeleted && profile?.cover_url)) && (
          <img
            src={
              selectedCover
                ? URL.createObjectURL(selectedCover)
                : coverDeleted
                  ? undefined
                  : profile?.cover_url || undefined
            }
            alt="Cover"
            className="w-full h-full object-cover transition-all duration-500"
          />
        )}

        {/* Overlay with Upload Controls */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-3 mx-auto w-fit">
              <Camera className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium mb-2">
              {(selectedCover || profile?.cover_url) && !coverDeleted ? "Update Cover Image" : "Upload Cover Image"}
            </p>
            <p className="text-xs opacity-90">
              Click to {(selectedCover || profile?.cover_url) && !coverDeleted ? "change" : "add"} your cover
            </p>
          </div>
        </div>

        {/* Upload Progress Overlay */}
        {isUploadingCover && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium mb-2">Uploading Cover Image</p>
              <div className="w-48 bg-white/20 rounded-full h-2 mb-1">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${coverProgress}%` }}
                />
              </div>
              <p className="text-xs">{coverProgress}%</p>
            </div>
          </div>
        )}

        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          {(selectedCover || profile?.cover_url) && !coverDeleted && (
            <Button
              size="sm"
              variant="destructive"
              className="bg-red-500/80 hover:bg-red-500 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                onCoverDelete()
              }}
              disabled={isSaving || isUploadingCover}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          id="cover-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isSaving || isUploadingCover}
        />
      </div>

      {/* Card Content */}
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon and Title */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">Cover Image</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a stunning cover image to showcase your personality and make your profile stand out.
            </p>

            {/* Image Metadata */}
            {coverMetadata && (
              <div className="bg-muted/50 rounded-lg p-4 border border-dashed mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Image Optimized</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{Math.round(coverMetadata.compressedSize / 1024)}KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">{coverMetadata.format.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">
                      {coverMetadata.dimensions.width}×{coverMetadata.dimensions.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saved:</span>
                    <span className="font-medium text-green-600">{coverMetadata.compressionRatio}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">💡</span>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Pro Tips</p>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
                    <li>• Use high-quality images (1200×400px recommended)</li>
                    <li>• Landscape photos work best for cover images</li>
                    <li>• Keep important content away from edges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  )
}
