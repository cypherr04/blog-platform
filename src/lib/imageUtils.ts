/**
 * Image utility functions for compression, conversion, and optimization
 */

export interface ImageCompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "webp" | "jpeg" | "png"
  maxSizeKB?: number
}

export interface ImageProcessingResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  format: string
  dimensions: { width: number; height: number }
}

/**
 * Compress and convert image to WebP format
 */
export async function compressAndConvertImage(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<ImageProcessingResult> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85, format = "webp", maxSizeKB = 500 } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(img.width, img.height, maxWidth, maxHeight)

        // Set canvas dimensions
        canvas.width = newWidth
        canvas.height = newHeight

        // Enable image smoothing for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw and compress image
          ctx.drawImage(img, 0, 0, newWidth, newHeight)
        }

        // Convert to blob with specified format and quality
        const currentQuality = quality
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"))
              return
            }

            // Check if we need to reduce quality further to meet size requirements
            let finalBlob = blob

            if (maxSizeKB && blob.size > maxSizeKB * 1024) {
              finalBlob = await reduceImageSize(canvas, format, maxSizeKB * 1024, currentQuality)
            }

            // Create new file with compressed data
            const fileExtension = format === "webp" ? "webp" : format === "jpeg" ? "jpg" : "png"
            const fileName = `${file.name.split(".")[0]}_compressed.${fileExtension}`
            const compressedFile = new File([finalBlob], fileName, {
              type: `image/${format}`,
              lastModified: Date.now(),
            })

            const result: ImageProcessingResult = {
              file: compressedFile,
              originalSize: file.size,
              compressedSize: finalBlob.size,
              compressionRatio: Math.round(((file.size - finalBlob.size) / file.size) * 100),
              format: format,
              dimensions: { width: newWidth, height: newHeight },
            }

            resolve(result)
          },
          `image/${format}`,
          currentQuality,
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    // Set crossOrigin to handle CORS issues
    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // Calculate scaling factor
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const scalingFactor = Math.min(widthRatio, heightRatio, 1) // Don't upscale

  width = Math.round(width * scalingFactor)
  height = Math.round(height * scalingFactor)

  return { width, height }
}

/**
 * Reduce image size by adjusting quality
 */
async function reduceImageSize(
  canvas: HTMLCanvasElement,
  format: string,
  targetSize: number,
  initialQuality: number,
): Promise<Blob> {
  let quality = initialQuality
  let blob: Blob | null = null

  // Try reducing quality until we meet the size requirement
  while (quality > 0.1) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, `image/${format}`, quality)
    })

    if (blob && blob.size <= targetSize) {
      break
    }

    quality -= 0.1
  }

  return blob || new Blob()
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please select a valid image file (JPEG, PNG, WebP, or GIF)",
    }
  }

  // Check file size (max 10MB for original file)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Image size must be less than 10MB",
    }
  }

  return { isValid: true }
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(file: File, size = 150): Promise<File> {
  const result = await compressAndConvertImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8,
    format: "webp",
    maxSizeKB: 50,
  })

  const thumbnailName = `${file.name.split(".")[0]}_thumb.webp`
  return new File([result.file], thumbnailName, {
    type: "image/webp",
    lastModified: Date.now(),
  })
}

/**
 * Create multiple image variants (thumbnail, medium, large)
 */
export async function createImageVariants(file: File): Promise<{
  thumbnail: File
  medium: File
  large: File
  original: ImageProcessingResult
}> {
  const [thumbnail, medium, large, original] = await Promise.all([
    generateThumbnail(file, 150),
    compressAndConvertImage(file, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.85,
      format: "webp",
      maxSizeKB: 200,
    }),
    compressAndConvertImage(file, {
      maxWidth: 1200,
      maxHeight: 900,
      quality: 0.9,
      format: "webp",
      maxSizeKB: 400,
    }),
    compressAndConvertImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.9,
      format: "webp",
      maxSizeKB: 800,
    }),
  ])

  return {
    thumbnail,
    medium: medium.file,
    large: large.file,
    original,
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * Get image metadata
 */
export async function getImageMetadata(file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
  name: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        name: file.name,
      })
    }

    img.onerror = () => {
      reject(new Error("Failed to load image metadata"))
    }

    img.src = URL.createObjectURL(file)
  })
}
