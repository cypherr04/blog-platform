"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ImageProcessingResult } from "@/lib/imageUtils"

const supabase = createClient()

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
  const [oldAvatarToDelete, setOldAvatarToDelete] = useState<string | null>(null)

  const checkBucketExists = async () => {
    try {
      const { data, error } = await supabase.storage.from("user-avatars").list("", { limit: 1 })

      if (error) {
        console.error("Bucket check error:", error)
        return false
      }

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

      const bucketExists = await checkBucketExists()
      if (!bucketExists) {
        console.warn("Bucket may not exist, but proceeding with upload...")
      }

      setUploadProgress(30)

      const timestamp = Date.now()
      const fileName = `avatar-${timestamp}.webp`
      const filePath = `avatars/${userId}/${fileName}`

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

      setUploadProgress(90)

      const { data: urlData } = supabase.storage.from("user-avatars").getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      setUploadProgress(100)
      onSuccess?.(publicUrl)

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

  const deleteAvatar = async (): Promise<void> => {
    if (!userId) {
      throw new Error("User ID is required for deletion")
    }

    try {
      setSelectedImage(null)
      setImageMetadata(null)
      setUploadProgress(0)
    } catch (error: any) {
      console.error("Avatar deletion failed:", error)
      const errorMessage = error.message || "Failed to delete avatar"
      onError?.(errorMessage)
      throw error
    }
  }

  const handleImageSelect = (file: File, metadata: ImageProcessingResult, currentAvatarUrl?: string) => {
    if (currentAvatarUrl) {
      setOldAvatarToDelete(currentAvatarUrl)
    }

    setSelectedImage(file)
    setImageMetadata(metadata)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setImageMetadata(null)
    setUploadProgress(0)
  }

  const reset = () => {
    setSelectedImage(null)
    setImageMetadata(null)
    setIsUploading(false)
    setUploadProgress(0)
    setOldAvatarToDelete(null)
  }

  return {
    selectedImage,
    imageMetadata,
    isUploading,
    uploadProgress,
    oldAvatarToDelete,
    uploadAvatar,
    deleteAvatar,
    handleImageSelect,
    handleImageRemove,
    reset,
  }
}
