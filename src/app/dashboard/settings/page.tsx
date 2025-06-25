"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/supabaseHelpers"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save } from "lucide-react"
import { useAvatarUpload } from "@/hooks/useAvatarUpload"
import { useCoverUpload } from "@/hooks/useCoverUpload"

// Import our new components
import { StatusMessages } from "@/components/settings/StatusMessages"
import { CoverImageSection } from "@/components/settings/CoverImageSection"
import { ProfilePictureSection } from "@/components/settings/ProfilePictureSection"
import { ProfileInformationSection } from "@/components/settings/ProfileInformationSection"
import { AccountTab } from "@/components/settings/AccountTab"
import { SecurityTab } from "@/components/settings/SecurityTab"

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
  const [avatarDeleted, setAvatarDeleted] = useState(false)
  const [coverDeleted, setCoverDeleted] = useState(false)

  // Avatar upload hook
  const {
    selectedImage: selectedAvatar,
    imageMetadata: avatarMetadata,
    isUploading: isUploadingAvatar,
    uploadProgress: avatarProgress,
    uploadAvatar,
    deleteAvatar,
    handleImageSelect: handleAvatarSelect,
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

  // Cover upload hook
  const {
    selectedImage: selectedCover,
    imageMetadata: coverMetadata,
    isUploading: isUploadingCover,
    uploadProgress: coverProgress,
    uploadCover,
    deleteCover,
    handleImageSelect: handleCoverSelect,
  } = useCoverUpload({
    userId: user?.id || "",
    onSuccess: (url) => {
      console.log("Cover upload successful:", url)
    },
    onError: (error) => {
      console.error("Cover upload error:", error)
      setError(`Cover upload failed: ${error}`)
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

  const handleLocationChange = (location: string) => {
    setFormData((prev) => ({ ...prev, location }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!user) {
      setError("You must be logged in to update your profile")
      return
    }

    setIsSaving(true)

    try {
      let newAvatarUrl = profile?.avatar_url || null
      let oldAvatarToDeleteUrl = null
      let newCoverUrl = profile?.cover_url || null
      let oldCoverToDeleteUrl = null

      // Handle avatar upload
      if (selectedAvatar) {
        newAvatarUrl = await uploadAvatar()
        if (profile?.avatar_url && profile.avatar_url !== newAvatarUrl) {
          oldAvatarToDeleteUrl = profile.avatar_url
        }
      } else if (avatarDeleted) {
        newAvatarUrl = null
        oldAvatarToDeleteUrl = profile?.avatar_url || null
      }

      // Handle cover upload
      if (selectedCover) {
        newCoverUrl = await uploadCover()
        if (profile?.cover_url && profile.cover_url !== newCoverUrl) {
          oldCoverToDeleteUrl = profile.cover_url
        }
      } else if (coverDeleted) {
        newCoverUrl = null
        oldCoverToDeleteUrl = profile?.cover_url || null
      }

      const updateData = {
        ...formData,
        avatar_url: newAvatarUrl,
        cover_url: newCoverUrl,
        delete_old_avatar: oldAvatarToDeleteUrl,
        delete_old_cover: oldCoverToDeleteUrl,
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update profile")
      }

      setSuccess("Profile updated successfully")
      setAvatarDeleted(false)
      setCoverDeleted(false)

      // Refresh the page to show updated data
      window.location.reload()
    } catch (err: any) {
      console.error("Error in profile update:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatar()
      setAvatarDeleted(true)
      setSuccess("Avatar will be deleted when you save changes")
    } catch (error: any) {
      setError(error.message || "Failed to delete avatar")
    }
  }

  const handleCoverDelete = async () => {
    try {
      await deleteCover()
      setCoverDeleted(true)
      setSuccess("Cover image will be deleted when you save changes")
    } catch (error: any) {
      setError(error.message || "Failed to delete cover image")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You must be logged in to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and profile information.</p>
      </div>

      {/* Status Messages */}
      <StatusMessages error={error} success={success} />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image Section */}
            <CoverImageSection
              selectedCover={selectedCover}
              coverMetadata={coverMetadata}
              isUploadingCover={isUploadingCover}
              coverProgress={coverProgress}
              profile={profile}
              coverDeleted={coverDeleted}
              isSaving={isSaving}
              onCoverSelect={handleCoverSelect}
              onCoverDelete={handleCoverDelete}
            />

            {/* Profile Picture Section */}
            <ProfilePictureSection
              selectedAvatar={selectedAvatar}
              avatarMetadata={avatarMetadata}
              isUploadingAvatar={isUploadingAvatar}
              avatarProgress={avatarProgress}
              profile={profile}
              user={user}
              avatarDeleted={avatarDeleted}
              isSaving={isSaving}
              onAvatarSelect={handleAvatarSelect}
              onAvatarDelete={handleAvatarDelete}
            />

            {/* Profile Information Section */}
            <ProfileInformationSection
              formData={formData}
              isSaving={isSaving}
              onChange={handleChange}
              onLocationChange={handleLocationChange}
            />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving || isUploadingAvatar || isUploadingCover}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isUploadingAvatar || isUploadingCover ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <AccountTab user={user} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityTab onPasswordChange={() => router.push("/forgot-password")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
