"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Trash2, Upload, Camera } from "lucide-react"

interface AvatarManagerProps {
  currentAvatar?: string | null
  onAvatarChange: (file: File | null, action: "upload" | "replace" | "delete") => void
  disabled?: boolean
  className?: string
}

export default function AvatarManager({
  currentAvatar,
  onAvatarChange,
  disabled = false,
  className = "",
}: AvatarManagerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Determine what image to show
  const displayImage = previewUrl || currentAvatar

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Create preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Determine action based on current state
      const action = currentAvatar ? "replace" : "upload"
      onAvatarChange(file, action)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDelete = () => {
    // Clean up preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    onAvatarChange(null, "delete")
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // No avatar state - show upload area
  if (!displayImage) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`
            w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer
            transition-colors duration-200
            ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? handleUploadClick : undefined}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center px-2">Click or drag to upload</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>
    )
  }

  // Has avatar state - show image with controls
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-32 h-32 rounded-lg overflow-hidden group">
        <img src={displayImage || "/placeholder.svg"} alt="Profile avatar" className="w-full h-full object-cover" />

        {/* Overlay with controls */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
            {/* Replace button */}
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={disabled}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Replace image"
            >
              <Camera className="w-4 h-4 text-gray-700" />
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Delete image"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Status indicator */}
      {previewUrl && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          New image selected - click Save to apply changes
        </div>
      )}
    </div>
  )
}
