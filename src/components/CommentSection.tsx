"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/supabaseHelpers"
import { supabase } from "@/lib/supabaseClient"

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user, profile } = useAuth()

  // Fetch comments
  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user || submitting) return

    setSubmitting(true)
    try {
      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      // Add authorization header if we have a session
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/comments/${postId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      })

      if (response.ok) {
        setNewComment("")
        await fetchComments() // Refresh comments
      } else {
        const errorData = await response.json()
        console.error("Failed to post comment:", errorData)
        alert("Failed to post comment. Please try again.")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    if (diffInHours < 168)
      return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? "s" : ""} ago`

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const CommentItem = ({ comment }: { comment: Comment }) => {
    const authorName = comment.profiles?.full_name || "Anonymous"

    return (
      <div className="mb-6">
        <div className="flex space-x-3">
          {comment.profiles?.avatar_url ? (
            <Image
              src={comment.profiles.avatar_url || "/placeholder.svg"}
              alt={authorName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">{authorName.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{authorName}</h4>
                <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-3">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url || "/placeholder.svg"}
                alt="Your avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">{profile?.full_name?.charAt(0) || "U"}</span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Join the discussion..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Please log in to join the discussion</p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </a>
        </div>
      )}

      {/* Comments List */}
      <div>
        {comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600 mb-2">No comments yet</p>
            <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
