"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Globe, MapPin } from "lucide-react"
import LocationInput from "@/components/LocationInput"

interface ProfileInformationSectionProps {
  formData: {
    full_name: string
    bio: string
    website: string
    location: string
  }
  isSaving: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onLocationChange: (location: string) => void
}

export function ProfileInformationSection({
  formData,
  isSaving,
  onChange,
  onLocationChange,
}: ProfileInformationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>Update your personal information and bio.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={onChange}
              disabled={isSaving}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <LocationInput
              value={formData.location}
              onChange={onLocationChange}
              disabled={isSaving}
              placeholder="Enter your location..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={onChange}
            disabled={isSaving}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={onChange}
            disabled={isSaving}
            placeholder="Tell us about yourself..."
            rows={4}
          />
          <p className="text-sm text-muted-foreground">Brief description for your profile. Maximum 500 characters.</p>
        </div>
      </CardContent>
    </Card>
  )
}
