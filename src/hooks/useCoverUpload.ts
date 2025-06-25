"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ImageProcessingResult } from "@/lib/imageUtils"

const supabase = createClient()

interface UseCoverUploadOptions {
  userId: string
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function useCoverUpload({ userId, onSuccess, onError }: UseCoverUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageMetadata, setImageMetadata] = useState<ImageProcessingResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [oldCoverToDelete, setOldCoverToDelete] = useState<string | null>(null)

  const checkBucketExists = async () => {
    try {
      const { data, error } = await supabase.storage.from("avatar-cover").list("", { limit: 1 })

      if (error) {
        console.error("Cover bucket check error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking cover bucket:", error)
      return false
    }
  }

  const uploadCover = async (): Promise<string | null> => {
    if (!selectedImage) {
      console.error("No cover image selected for upload")
      return null
    }

    if (!userId) {
      console.error("No user ID provided")
      throw new Error("User ID is required for upload")
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)

      console.log("Starting cover upload for user:", userId)
      console.log("Selected cover image:", {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type,
      })

      const bucketExists = await checkBucketExists()
      if (!bucketExists) {
        console.warn("Cover bucket may not exist, but proceeding with upload...")
      }

      setUploadProgress(30)

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const fileName = `cover-${timestamp}.webp`

      // Path structure: covers/{userId}/{filename}
      const filePath = `covers/${userId}/${fileName}`

      console.log("Uploading cover to path:", filePath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("avatar-cover").upload(filePath, selectedImage, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/webp",
      })

      setUploadProgress(70)

      if (error) {
        console.error("Cover upload error:", error)
        throw new Error(`Cover upload failed: ${error.message}`)
      }

      console.log("Cover upload successful:", data)
      setUploadProgress(90)

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatar-cover").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      console.log("Cover public URL:", publicUrl)

      setUploadProgress(100)
      onSuccess?.(publicUrl)

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000)

      return publicUrl
    } catch (error: any) {
      console.error("Cover upload failed:", error)
      const errorMessage = error.message || "Failed to upload cover image"
      onError?.(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const deleteCover = async (): Promise<void> => {
    if (!userId) {
      throw new Error("User ID is required for deletion")
    }

    try {
      console.log("Deleting current cover...")

      // Mark current cover for deletion but don't delete immediately
      setSelectedImage(null)
      setImageMetadata(null)
      setUploadProgress(0)

      console.log("Cover marked for deletion")
    } catch (error: any) {
      console.error("Cover deletion failed:", error)
      const errorMessage = error.message || "Failed to delete cover image"
      onError?.(errorMessage)
      throw error
    }
  }

  const handleImageSelect = (file: File, metadata: ImageProcessingResult, currentCoverUrl?: string) => {
    console.log("Cover image selected:", {
      originalSize: metadata.originalSize,
      compressedSize: metadata.compressedSize,
      compressionRatio: metadata.compressionRatio,
      format: metadata.format,
      dimensions: metadata.dimensions,
    })

    // If there's a current cover, mark it for deletion when new one is uploaded
    if (currentCoverUrl) {
      setOldCoverToDelete(currentCoverUrl)
    }

    setSelectedImage(file)
    setImageMetadata(metadata)
  }

  const handleImageRemove = () => {
    console.log("Cover image removed")
    setSelectedImage(null)
    setImageMetadata(null)
    setUploadProgress(0)
  }

  const reset = () => {
    setSelectedImage(null)
    setImageMetadata(null)
    setIsUploading(false)
    setUploadProgress(0)
    setOldCoverToDelete(null)
  }

  return {
    selectedImage,
    imageMetadata,
    isUploading,
    uploadProgress,
    oldCoverToDelete,
    uploadCover,
    deleteCover,
    handleImageSelect,
    handleImageRemove,
    reset,
  }
}
