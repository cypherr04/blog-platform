"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateUserProfile, useAuth } from "@/lib/supabaseHelpers"
import ImageUpload from "@/components/imageUpload"
import { useAvatarUpload } from "@/hooks/useAvatarUpload"

// Function to setup storage if needed
const setupStorageIfNeeded = async () => {
  try {
    const response = await fetch("/api/storage/setup", {
      method: "POST",
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Storage setup failed:", error)
      return false
    }

    const result = await response.json()
    console.log("Storage setup result:", result)
    return true
  } catch (error) {
    console.error("Error setting up storage:", error)
    return false
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    website: "",
    location: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Use the avatar upload hook with better error handling
  const {
    selectedImage,
    imageMetadata,
    isUploading,
    uploadProgress,
    uploadAvatar,
    handleImageSelect,
    handleImageRemove,
  } = useAvatarUpload({
    userId: user?.id || "",
    onSuccess: (url) => {
      console.log("Avatar upload successful:", url)
    },
    onError: (error) => {
      console.error("Avatar upload error:", error)
      setError(`Avatar upload failed: ${error}`)
    },
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        website: profile.website || "",
        location: profile.location || "",
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user) {
      setError("You must be logged in to update your profile")
      return
    }

    console.log("Starting profile update...")
    console.log("User ID:", user.id)
    console.log("Has selected image:", !!selectedImage)

    setIsSaving(true)

    try {
      // Setup storage if we have an image to upload
      if (selectedImage) {
        console.log("Setting up storage...")
        const storageReady = await setupStorageIfNeeded()
        if (!storageReady) {
          console.warn("Storage setup failed, but continuing with upload...")
        }
      }

      // Upload avatar if selected
      let avatarUrl = profile?.avatar_url || null

      if (selectedImage) {
        console.log("Uploading new avatar...")
        avatarUrl = await uploadAvatar()
        console.log("New avatar URL:", avatarUrl)
      }

      // Update profile in database
      console.log("Updating profile with data:", {
        ...formData,
        avatar_url: avatarUrl,
      })

      await updateUserProfile(user.id, {
        ...formData,
        avatar_url: avatarUrl,
      })

      setSuccess("Profile updated successfully")
      console.log("Profile update completed successfully")
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You must be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account preferences and profile information.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="space-y-4">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  currentImage={selectedImage ? URL.createObjectURL(selectedImage) : profile?.avatar_url}
                  maxSizeKB={200}
                  maxWidth={400}
                  maxHeight={400}
                  quality={0.9}
                  disabled={isSaving || isUploading}
                  className="max-w-md"
                />

                {/* Upload Progress */}
                {isUploading && uploadProgress > 0 && (
                  <div className="max-w-md">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading avatar...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Image Metadata Display */}
                {imageMetadata && (
                  <div className="max-w-md p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">Image Optimized</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Size: {Math.round(imageMetadata.compressedSize / 1024)}KB</div>
                        <div>Format: {imageMetadata.format.toUpperCase()}</div>
                        <div>
                          Dimensions: {imageMetadata.dimensions.width}×{imageMetadata.dimensions.height}
                        </div>
                        <div>Saved: {imageMetadata.compressionRatio}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={formData.full_name}
                onChange={handleChange}
                disabled={isSaving}
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={formData.bio}
                onChange={handleChange}
                disabled={isSaving}
                placeholder="Tell us about yourself..."
              ></textarea>
              <p className="mt-1 text-sm text-gray-500">Brief description for your profile.</p>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                disabled={isSaving}
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                disabled={isSaving}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500"
                value={user?.email || ""}
                readOnly
              />
              <p className="mt-1 text-sm text-gray-500">
                Your email address is associated with your account and cannot be changed here.
              </p>
            </div>

            {/* Error and Success Messages */}
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

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">{success}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving || isUploading}
              >
                {isSaving ? "Saving..." : isUploading ? "Uploading..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Account Management Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Account Management</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <p className="mt-1 text-sm text-gray-500">Update your password to keep your account secure.</p>
                <button
                  onClick={() => router.push("/forgot-password")}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Password
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-red-600">Delete Account</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Permanently delete your account and all of your content. This action cannot be undone.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                      alert("Account deletion functionality will be implemented in the future.")
                    }
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
