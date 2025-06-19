import Link from "next/link"

interface TagPillProps {
  name: string
  slug: string
  color?: string
}

const tagColors = [
  "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "bg-green-100 text-green-800 hover:bg-green-200",
  "bg-purple-100 text-purple-800 hover:bg-purple-200",
  "bg-orange-100 text-orange-800 hover:bg-orange-200",
  "bg-pink-100 text-pink-800 hover:bg-pink-200",
  "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  "bg-red-100 text-red-800 hover:bg-red-200",
]

export default function TagPill({ name, slug, color }: TagPillProps) {
  // Generate consistent color based on tag name
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % tagColors.length
  const colorClass = color || tagColors[colorIndex]

  return (
    <Link
      href={`/tags/${slug}`}
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colorClass} mr-2 mb-2 transition-colors cursor-pointer`}
    >
      {name}
    </Link>
  )
}
