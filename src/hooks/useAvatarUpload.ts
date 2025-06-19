"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { ImageProcessingResult } from "@/lib/imageUtils"

interface UseAvatarUploadOptions {
  userId: string
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function useAvatarUpload({ userId, onSuccess, onError }: UseAvatarUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageMetadata, setImageMetadata] = useState<ImageProcessingResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const checkBucketExists = async () => {
    try {
      console.log("Checking if user-avatars bucket exists...")

      // Try to list files in the bucket to see if it exists and is accessible
      const { data, error } = await supabase.storage.from("user-avatars").list("", { limit: 1 })

      if (error) {
        console.error("Bucket check error:", error)
        // If bucket doesn't exist or we can't access it, that's expected
        // The bucket should be created manually by admin or through the SQL script
        return false
      }

      console.log("Bucket exists and is accessible")
      return true
    } catch (error) {
      console.error("Error checking bucket:", error)
      return false
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
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

      console.log("Starting avatar upload for user:", userId)
      console.log("Selected image:", {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type,
      })

      // Check if bucket exists (but don't try to create it from client)
      const bucketExists = await checkBucketExists()
      if (!bucketExists) {
        console.warn("Bucket may not exist, but proceeding with upload...")
      }

      setUploadProgress(30)

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const fileName = `avatar-${timestamp}.webp`

      // Correct path structure: avatars/{userId}/{filename}
      const filePath = `avatars/${userId}/${fileName}`

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

      // Get public URL with correct path structure
      const { data: urlData } = supabase.storage.from("user-avatars").getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      console.log("Public URL:", publicUrl)

      // Verify the URL structure matches expected format
      const expectedPattern = `/storage/v1/object/public/user-avatars/avatars/${userId}/`
      if (!publicUrl.includes(expectedPattern)) {
        console.warn("URL structure may not match expected format:", publicUrl)
      }

      setUploadProgress(100)
      onSuccess?.(publicUrl)

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000)

      return publicUrl
    } catch (error: any) {
      console.error("Avatar upload failed:", error)
      const errorMessage = error.message || "Failed to upload avatar"
      onError?.(errorMessage)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageSelect = (file: File, metadata: ImageProcessingResult) => {
    console.log("Image selected:", {
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
    console.log("Image removed")
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
    uploadAvatar,
    handleImageSelect,
    handleImageRemove,
    reset,
  }
}
