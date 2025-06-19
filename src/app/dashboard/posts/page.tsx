"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Post, PostStatus } from "@/lib/types";
import { getUserPosts, deletePost, updatePost } from "@/lib/supabaseHelpers";
import { supabase } from "@/lib/supabaseClient";

export default function MyPostsPage() {
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserPosts() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }
        
        // Fetch user's posts
        const posts = await getUserPosts(user.id);
        setUserPosts(posts);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserPosts();
  }, [router]);

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId);
        setUserPosts(userPosts.filter(post => post.id !== postId));
        alert("Post deleted successfully.");
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  const handlePublishToggle = async (postId: string, currentStatus: PostStatus) => {
    try {
      const newStatus = currentStatus === PostStatus.PUBLISHED ? PostStatus.DRAFT : PostStatus.PUBLISHED;
      const publishedAt = newStatus === PostStatus.PUBLISHED ? new Date() : null;
      
      await updatePost(postId, { 
        status: newStatus,
        published_at: publishedAt ? publishedAt.toISOString() : null
      });
      
      setUserPosts(userPosts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus, published_at: publishedAt ? publishedAt.toISOString() : null } 
          : post
      ));
      
      alert(`Post ${newStatus === PostStatus.PUBLISHED ? "published" : "unpublished"} successfully.`);
    } catch (err) {
      console.error("Error updating post status:", err);
      alert("Failed to update post status. Please try again.");
    }
  };

  if (isLoading) {
    return <p className="text-center py-12">Loading your posts...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-12">{error}</p>;
  }

  return (
    <section className="py-12">
      <h2 className="text-4xl font-bold mb-8 text-center">My Posts</h2>
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-end mb-6">
          <Link
            href="/dashboard/posts/new"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Create New Post
          </Link>
        </div>
        {userPosts.length === 0 ? (
          <p className="text-center text-gray-600">You haven't created any posts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Published Date</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      <Link href={`/posts/${post.slug}`} className="text-blue-600 hover:underline">
                        {post.title}
                      </Link>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === PostStatus.PUBLISHED ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      <Link href={`/dashboard/posts/${post.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </Link>
                      <button
                        onClick={() => handlePublishToggle(post.id, post.status)}
                        className={`text-sm font-medium ${post.status === PostStatus.PUBLISHED ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"} mr-3`}
                      >
                        {post.status === PostStatus.PUBLISHED ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
