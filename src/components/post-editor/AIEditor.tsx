"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Copy, Edit3 } from "lucide-react"

interface GeneratedContent {
  title: string
  summary: string
  content: string
}

interface AIEditorProps {
  aiTopic: string
  setAiTopic: (topic: string) => void
  aiKeywords: string
  setAiKeywords: (keywords: string) => void
  generatedContent: GeneratedContent | null
  isGenerating: boolean
  onGenerateContent: () => void
  onEditManually: () => void
}

export default function AIEditor({
  aiTopic,
  setAiTopic,
  aiKeywords,
  setAiKeywords,
  generatedContent,
  isGenerating,
  onGenerateContent,
  onEditManually,
}: AIEditorProps) {
  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(
        `Title: ${generatedContent.title}\n\nSummary: ${generatedContent.summary}\n\nContent: ${generatedContent.content}`,
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-8">
          {/* AI Generator Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Content Generator</h2>
            <p className="text-gray-600">Generate high-quality blog posts with artificial intelligence</p>
          </div>

          {/* Input Fields */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="topic title or whatever"
                className="w-full"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <Input
                value={aiKeywords}
                onChange={(e) => setAiKeywords(e.target.value)}
                placeholder="keywords for the ai to generate content based on"
                className="w-full"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple keywords with commas</p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={onGenerateContent}
            disabled={isGenerating || !aiTopic.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg font-medium"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {/* Generated Content */}
          {generatedContent && (
            <div className="mt-8">
              <Separator className="mb-6" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                    className="flex items-center space-x-1 bg-transparent"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={onEditManually}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Manually</span>
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Title:</h4>
                  <p className="text-gray-700">{generatedContent.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Summary:</h4>
                  <p className="text-gray-700">{generatedContent.summary}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Content:</h4>
                  <div
                    className="text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
