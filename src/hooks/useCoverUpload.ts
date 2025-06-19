"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { ImageProcessingResult } from "@/lib/imageUtils"

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

  const uploadCover = async (): Promise<string | null> => {
    if (!selectedImage) {
      console.error("No image selected for upload")
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
      console.log("Selected image:", {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type,
      })

      setUploadProgress(30)

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const fileName = `cover-${timestamp}.webp`

      // Path structure: covers/{userId}/{filename}
      const filePath = `covers/${userId}/${fileName}`

      console.log("Uploading to path:", filePath)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("user-avatars").upload(filePath, selectedImage, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/webp",
      })

      setUploadProgress(70)

      if (error) {
        console.error("Upload error:", error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log("Upload successful:", data)
      setUploadProgress(90)

      // Get public URL
      const { data: urlData } = supabase.storage.from("user-avatars").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      console.log("Public URL:", publicUrl)

      setUploadProgress(100)
      onSuccess?.(publicUrl)

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000)

      return publicUrl
    } catch (error: any) {
      console.error("Cover upload failed:", error)
      const errorMessage = error.message || "Failed to upload cover photo"
      onError?.(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageSelect = (file: File, metadata: ImageProcessingResult) => {
    console.log("Cover image selected:", {
      originalSize: metadata.originalSize,
      compressedSize: metadata.compressedSize,
      compressionRatio: metadata.compressionRatio,
      format: metadata.format,
      dimensions: metadata.dimensions,
    })

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
  }

  return {
    selectedImage,
    imageMetadata,
    isUploading,
    uploadProgress,
    uploadCover,
    handleImageSelect,
    handleImageRemove,
    reset,
  }
}
