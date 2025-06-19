"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import {
  compressAndConvertImage,
  validateImageFile,
  formatFileSize,
  getImageMetadata,
  type ImageProcessingResult,
} from "@/lib/imageUtils"

interface ImageUploadProps {
  onImageSelect: (file: File, metadata: ImageProcessingResult) => void
  onImageRemove: () => void
  currentImage?: string | null
  maxSizeKB?: number
  maxWidth?: number
  maxHeight?: number
  quality?: number
  disabled?: boolean
  className?: string
}

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  currentImage,
  maxSizeKB = 500,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85,
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [imageMetadata, setImageMetadata] = useState<any>(null)
  const [compressionStats, setCompressionStats] = useState<ImageProcessingResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback(
    async (file: File) => {
      setError(null)
      setIsProcessing(true)
      setProcessingProgress(0)

      try {
        // Validate file
        const validation = validateImageFile(file)
        if (!validation.isValid) {
          setError(validation.error || "Invalid file")
          return
        }

        setProcessingProgress(20)

        // Get original metadata
        const metadata = await getImageMetadata(file)
        setImageMetadata(metadata)
        setProcessingProgress(40)

        // Compress and convert image
        const result = await compressAndConvertImage(file, {
          maxWidth,
          maxHeight,
          quality,
          format: "webp",
          maxSizeKB,
        })

        setProcessingProgress(80)
        setCompressionStats(result)

        // Call parent callback
        onImageSelect(result.file, result)
        setProcessingProgress(100)
      } catch (err: any) {
        console.error("Error processing image:", err)
        setError(err.message || "Failed to process image")
      } finally {
        setIsProcessing(false)
        setTimeout(() => setProcessingProgress(0), 1000)
      }
    },
    [maxWidth, maxHeight, quality, maxSizeKB, onImageSelect],
  )

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      processImage(file)
    },
    [processImage],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled) return

      const files = e.dataTransfer.files
      handleFileSelect(files)
    },
    [disabled, handleFileSelect],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
    },
    [handleFileSelect],
  )

  const handleRemove = useCallback(() => {
    setImageMetadata(null)
    setCompressionStats(null)
    setError(null)
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onImageRemove])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!currentImage ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? "border-purple-400 bg-purple-50" : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled || isProcessing}
            className="hidden"
          />

          <div className="text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Processing image...</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{processingProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">Upload an image</p>
                  <p className="text-sm text-gray-500">Drag and drop or click to select</p>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Supports: JPEG, PNG, WebP, GIF</p>
                  <p>Max size: 10MB • Output: WebP format</p>
                  <p>Auto-compressed to {maxSizeKB}KB max</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Image Preview */
        <div className="relative">
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            <Image src={currentImage || "/placeholder.svg"} alt="Selected image" fill className="object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <button
                onClick={handleRemove}
                disabled={disabled}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Stats */}
          {compressionStats && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-green-800">Optimized</span>
                </div>
                <div className="text-green-700">{compressionStats.compressionRatio}% smaller</div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-green-700">
                <div>
                  <span className="font-medium">Original:</span> {formatFileSize(compressionStats.originalSize)}
                </div>
                <div>
                  <span className="font-medium">Compressed:</span> {formatFileSize(compressionStats.compressedSize)}
                </div>
                <div>
                  <span className="font-medium">Dimensions:</span> {compressionStats.dimensions.width}×
                  {compressionStats.dimensions.height}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {compressionStats.format.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Button (Alternative) */}
      {!currentImage && !isProcessing && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Choose Image
        </button>
      )}
    </div>
  )
}
