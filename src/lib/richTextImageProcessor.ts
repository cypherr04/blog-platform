import { compressAndConvertImage, type ImageProcessingResult } from "./imageUtils"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface ImageUploadResult {
  originalSrc: string
  newSrc: string
  metadata: ImageProcessingResult
}

export interface ProcessingProgress {
  total: number
  completed: number
  current: string
  failed: string[]
}

/**
 * Extract all image sources from HTML content
 */
export function extractImageSources(htmlContent: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const sources: string[] = []
  let match

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const src = match[1]
    // Only process blob URLs and data URLs (newly uploaded images)
    if (src.startsWith("blob:") || src.startsWith("data:")) {
      sources.push(src)
    }
  }

  console.log("Extracted image sources:", sources)
  return sources
}

/**
 * Convert blob URL or data URL to File object with timeout
 */
export async function urlToFile(url: string, filename: string, timeoutMs = 10000): Promise<File> {
  console.log(`Converting URL to file: ${filename}`)

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout converting ${filename} after ${timeoutMs}ms`))
    }, timeoutMs)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`)
      }

      const blob = await response.blob()
      const file = new File([blob], filename, { type: blob.type })

      clearTimeout(timeout)
      console.log(`Successfully converted ${filename}, size: ${file.size} bytes`)
      resolve(file)
    } catch (error) {
      clearTimeout(timeout)
      console.error(`Error converting URL to file ${filename}:`, error)
      reject(error)
    }
  })
}

/**
 * Upload a single image to Supabase storage with timeout
 */
export async function uploadImageToStorage(file: File, userId: string, timeoutMs = 30000): Promise<string> {
  console.log(`Uploading image: ${file.name}, size: ${file.size} bytes`)

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Upload timeout for ${file.name} after ${timeoutMs}ms`))
    }, timeoutMs)

    try {
      // Create unique file path
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)
      const fileExtension = file.name.split(".").pop() || "webp"
      const fileName = `${userId}/${timestamp}_${randomId}.${fileExtension}`
      const filePath = `post-images/${fileName}`

      console.log(`Uploading to path: ${filePath}`)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("blog-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

      if (error) {
        console.error(`Upload error for ${file.name}:`, error)
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(filePath)

      clearTimeout(timeout)
      console.log(`Successfully uploaded ${file.name} to ${publicUrl}`)
      resolve(publicUrl)
    } catch (error) {
      clearTimeout(timeout)
      console.error(`Error uploading ${file.name}:`, error)
      reject(error)
    }
  })
}

/**
 * Process a single image with comprehensive error handling
 */
export async function processSingleImage(
  src: string,
  userId: string,
  index: number,
): Promise<ImageUploadResult | null> {
  console.log(`Processing image ${index + 1}: ${src.substring(0, 50)}...`)

  try {
    // Convert URL to File with timeout
    const filename = `image_${Date.now()}_${index}.jpg`
    const file = await urlToFile(src, filename, 10000)

    // Compress and optimize image
    console.log(`Compressing image ${index + 1}...`)
    const optimizedResult = await compressAndConvertImage(file, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.85,
      format: "webp",
      maxSizeKB: 500,
    })

    console.log(`Compressed ${filename}: ${file.size} -> ${optimizedResult.file.size} bytes`)

    // Upload optimized image
    const publicUrl = await uploadImageToStorage(optimizedResult.file, userId, 30000)

    // Clean up blob URL
    if (src.startsWith("blob:")) {
      URL.revokeObjectURL(src)
    }

    return {
      originalSrc: src,
      newSrc: publicUrl,
      metadata: optimizedResult,
    }
  } catch (error) {
    console.error(`Failed to process image ${index + 1}:`, error)
    return null
  }
}

/**
 * Process rich text images with better error handling and timeouts
 */
export async function processRichTextImages(
  htmlContent: string,
  userId: string,
  onProgress?: (progress: ProcessingProgress) => void,
): Promise<{ processedContent: string; uploadResults: ImageUploadResult[] }> {
  console.log("Starting rich text image processing...")

  const imageSources = extractImageSources(htmlContent)

  if (imageSources.length === 0) {
    console.log("No images to process")
    return { processedContent: htmlContent, uploadResults: [] }
  }

  console.log(`Found ${imageSources.length} images to process`)

  const uploadResults: ImageUploadResult[] = []
  const failed: string[] = []
  let processedContent = htmlContent

  // Process images one by one to avoid overwhelming the system
  for (let i = 0; i < imageSources.length; i++) {
    const src = imageSources[i]

    // Update progress
    onProgress?.({
      total: imageSources.length,
      completed: i,
      current: `Processing image ${i + 1} of ${imageSources.length}`,
      failed,
    })

    try {
      const result = await processSingleImage(src, userId, i)

      if (result) {
        // Replace in content
        processedContent = processedContent.replace(src, result.newSrc)
        uploadResults.push(result)
        console.log(`Successfully processed image ${i + 1}`)
      } else {
        failed.push(src)
        console.log(`Failed to process image ${i + 1}`)
      }
    } catch (error) {
      console.error(`Error processing image ${i + 1}:`, error)
      failed.push(src)
    }

    // Small delay to prevent overwhelming the system
    if (i < imageSources.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  // Final progress update
  onProgress?.({
    total: imageSources.length,
    completed: imageSources.length,
    current: "Processing complete",
    failed,
  })

  console.log(`Image processing complete. Success: ${uploadResults.length}, Failed: ${failed.length}`)

  return { processedContent, uploadResults }
}
