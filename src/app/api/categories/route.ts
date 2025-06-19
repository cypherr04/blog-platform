import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    // First get all categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

    if (categoriesError) throw categoriesError

    if (!categories || categories.length === 0) {
      return NextResponse.json({ data: [], error: null })
    }

    // Then get post counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const { count, error: countError } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id)
          .eq("status", "PUBLISHED")

        if (countError) {
          console.warn(`Error counting posts for category ${category.name}:`, countError)
          return { ...category, post_count: 0 }
        }

        return { ...category, post_count: count || 0 }
      }),
    )

    return NextResponse.json({ data: categoriesWithCounts, error: null })
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ data: null, error: "Failed to fetch categories" }, { status: 500 })
  }
}
