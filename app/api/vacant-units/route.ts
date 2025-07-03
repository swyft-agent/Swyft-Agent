import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("company_id")
    const limit = searchParams.get("limit")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 })
    }

    let query = supabase
      .from("vacant_units")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: units, error } = await query

    if (error) {
      console.error("Vacant units fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch vacant units" }, { status: 500 })
    }

    return NextResponse.json({ units: units || [] })
  } catch (error) {
    console.error("Vacant units API error:", error)
    return NextResponse.json({ error: "Failed to fetch vacant units" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabase.from("vacant_units").insert([body]).select()

    if (error) {
      console.error("Insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ unit: data[0] })
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 })
  }
}
