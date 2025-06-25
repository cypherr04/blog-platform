"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Upload, ImageIcon } from "lucide-react"
import type { ProcessingProgress } from "@/lib/richTextImageProcessor"

interface ImageProcessingProgressProps {
  progress: ProcessingProgress
  isVisible: boolean
}

export default function ImageProcessingProgress({ progress, isVisible }: ImageProcessingProgressProps) {
  if (!isVisible) return null

  const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0
  const isComplete = progress.completed === progress.total

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {isComplete ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Upload className="w-6 h-6 text-blue-600 animate-pulse" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isComplete ? "Processing Complete!" : "Processing Images"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{progress.current}</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {progress.completed} of {progress.total}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {progress.total > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Processed: {progress.completed}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Total: {progress.total}</span>
              </div>
            </div>
          )}

          {progress.failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Failed to process {progress.failed.length} image(s)
                </span>
              </div>
              <p className="text-xs text-red-600">
                These images will be skipped. You can try uploading them again later.
              </p>
            </div>
          )}
        </div>

        {isComplete && (
          <div className="mt-6 text-center">
            <p className="text-sm text-green-600 font-medium">
              All images have been optimized and uploaded successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
