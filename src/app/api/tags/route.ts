import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) throw error

    return NextResponse.json({ data: data || [], error: null })
  } catch (error: any) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ data: null, error: "Failed to fetch tags" }, { status: 500 })
  }
}
