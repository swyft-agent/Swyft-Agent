import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("company_id")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 })
    }

    const { data: inquiries, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Inquiries fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
    }

    return NextResponse.json({ inquiries: inquiries || [] })
  } catch (error) {
    console.error("Inquiries API error:", error)
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from("inquiries").insert([body]).select()

    if (error) {
      console.error("Insert inquiry error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ inquiry: data[0] })
  } catch (error) {
    console.error("POST inquiry error:", error)
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 })
  }
}
