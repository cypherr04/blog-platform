import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import ImageUpload from "@/components/imageUpload"

interface ProfilePictureSectionProps {
  selectedAvatar: File | null
  avatarMetadata: any
  isUploadingAvatar: boolean
  avatarProgress: number
  profile: any
  user: any
  avatarDeleted: boolean
  isSaving: boolean
  onAvatarSelect: (file: File, metadata: any, existingUrl?: string) => void
  onAvatarDelete: () => void
}

export function ProfilePictureSection({
  selectedAvatar,
  avatarMetadata,
  isUploadingAvatar,
  avatarProgress,
  profile,
  user,
  avatarDeleted,
  isSaving,
  onAvatarSelect,
  onAvatarDelete,
}: ProfilePictureSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>Upload a profile picture to personalize your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={
                selectedAvatar
                  ? URL.createObjectURL(selectedAvatar)
                  : avatarDeleted
                    ? undefined
                    : profile?.avatar_url || undefined
              }
            />
            <AvatarFallback className="text-lg">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <ImageUpload
              onImageSelect={(file, metadata) => onAvatarSelect(file, metadata, profile?.avatar_url || undefined)}
              onImageDelete={onAvatarDelete}
              currentImage={
                selectedAvatar ? URL.createObjectURL(selectedAvatar) : avatarDeleted ? null : profile?.avatar_url
              }
              maxSizeKB={200}
              maxWidth={400}
              maxHeight={400}
              quality={0.9}
              disabled={isSaving || isUploadingAvatar}
              className="max-w-md"
            />
          </div>
        </div>

        {/* Avatar Upload Progress */}
        {isUploadingAvatar && avatarProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading avatar...</span>
              <span>{avatarProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${avatarProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Avatar Image Metadata */}
        {avatarMetadata && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm space-y-1">
              <div className="font-medium">Avatar Optimized</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Size: {Math.round(avatarMetadata.compressedSize / 1024)}KB</div>
                <div>Format: {avatarMetadata.format.toUpperCase()}</div>
                <div>
                  Dimensions: {avatarMetadata.dimensions.width}×{avatarMetadata.dimensions.height}
                </div>
                <div>Saved: {avatarMetadata.compressionRatio}%</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
