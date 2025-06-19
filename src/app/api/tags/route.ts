import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) throw error

    return NextResponse.json({ data: data || [], error: null })
  } catch (error: any) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ data: null, error: "Failed to fetch tags" }, { status: 500 })
  }
}
