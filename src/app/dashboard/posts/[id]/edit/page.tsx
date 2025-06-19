"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { mockPosts, mockCategories, mockTags } from "@/lib/mockData"
import { type Post, PostStatus } from "@/lib/types"

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [category, setCategory] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const foundPost = mockPosts.find((p) => p.id === params.id)
    if (foundPost) {
      setPost(foundPost)
      setTitle(foundPost.title)
      setContent(foundPost.content)
      setSummary(foundPost.summary)
      setImageUrl(foundPost.image_url || "")
      setCategory(foundPost.category_id || "")
      setSelectedTags(foundPost.tags || [])
      setStatus(foundPost.status)
    } else {
      router.push("/dashboard/posts") // Redirect if post not found
    }
  }, [params.id, router])

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId) ? prevTags.filter((id) => id !== tagId) : [...prevTags, tagId],
    )
  }

  const handleSubmit = (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    setError(null)

    if (!title || !content || !category) {
      setError("Title, Content, and Category are required.")
      return
    }

    if (!post) return // Should not happen if post is found

    const updatedPost: Post = {
      ...post,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-*|-*$/g, ""),
      content,
      summary,
      image_url: imageUrl,
      status: publish ? PostStatus.PUBLISHED : PostStatus.DRAFT,
      updated_at: new Date().toISOString(),
      published_at: publish ? new Date().toISOString() : null,
      category_id: category,
      tags: selectedTags,
    }

    // Simulate updating mock data
    const postIndex = mockPosts.findIndex((p) => p.id === post.id)
    if (postIndex > -1) {
      mockPosts[postIndex] = updatedPost
    }

    alert(`Post ${publish ? "published" : "saved as draft"} successfully (mock).`)
    router.push("/dashboard/posts")
  }

  if (!post) {
    return <p className="text-center">Loading post...</p>
  }

  return (
    <section className="py-12">
      <h2 className="text-4xl font-bold mb-8 text-center">Edit Post</h2>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">
              Content
            </label>
            {/* Simple textarea for content, replace with rich text editor later */}
            <textarea
              id="content"
              rows={10}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="summary" className="block text-gray-700 text-sm font-bold mb-2">
              Summary
            </label>
            <textarea
              id="summary"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g., https://via.placeholder.com/800x400"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <select
              id="category"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {mockCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {mockTags.map((tag) => (
                <label key={tag.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagChange(tag.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs italic text-center">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
