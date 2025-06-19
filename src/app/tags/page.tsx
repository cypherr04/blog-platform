import Link from "next/link"

interface Tag {
  id: number
  name: string
  slug: string
}

// Function to generate a consistent color based on string
const getTagColor = (str: string) => {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-800", hover: "hover:bg-blue-200" },
    { bg: "bg-green-100", text: "text-green-800", hover: "hover:bg-green-200" },
    { bg: "bg-purple-100", text: "text-purple-800", hover: "hover:bg-purple-200" },
    { bg: "bg-yellow-100", text: "text-yellow-800", hover: "hover:bg-yellow-200" },
    { bg: "bg-red-100", text: "text-red-800", hover: "hover:bg-red-200" },
    { bg: "bg-indigo-100", text: "text-indigo-800", hover: "hover:bg-indigo-200" },
    { bg: "bg-pink-100", text: "text-pink-800", hover: "hover:bg-pink-200" },
    { bg: "bg-teal-100", text: "text-teal-800", hover: "hover:bg-teal-200" },
    { bg: "bg-orange-100", text: "text-orange-800", hover: "hover:bg-orange-200" },
    { bg: "bg-cyan-100", text: "text-cyan-800", hover: "hover:bg-cyan-200" },
  ]

  // Simple hash function to get consistent index
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

async function getTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/tags`, {
      cache: "force-cache", // Cache tags as they don't change often
    })

    if (!res.ok) {
      throw new Error("Failed to fetch tags")
    }

    const result = await res.json()
    return result.data || []
  } catch (error) {
    console.error("Error fetching tags:", error)
    return []
  }
}

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Tags</h1>

        {tags.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white p-8 rounded-lg shadow-md inline-block max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No Tags Found</h3>
              <p className="text-gray-600 mb-6">Tags will appear here once they are created.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {tags.map((tag) => {
              const colorStyle = getTagColor(tag.name)
              return (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className={`${colorStyle.bg} ${colorStyle.text} px-4 py-2 rounded-full text-lg font-medium ${colorStyle.hover} transition-colors`}
                >
                  {tag.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
