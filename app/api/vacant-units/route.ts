import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "https://swyft-housing.vercel.app",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }

  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("company_id")
    const userId = searchParams.get("user_id")
    const isPublic = searchParams.get("public") === "true"

    // Validate UUID format
    function isValidUUID(uuid: string | null): boolean {
      if (!uuid) return false
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      return uuidRegex.test(uuid)
    }

    let query = supabase.from("vacant_units").select("*").order("created_at", { ascending: false })

    if (isPublic) {
      // Public API access - no filtering, return all available units
      query = query.eq("status", "available")
    } else if (companyId && isValidUUID(companyId)) {
      // Company user
      query = query.eq("company_account_id", companyId)
    } else if (userId && isValidUUID(userId)) {
      // Individual user
      query = query.eq("user_id", userId)
    } else {
      return NextResponse.json({ error: "Valid company_id or user_id required" }, { status: 400, headers })
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch vacant units" }, { status: 500, headers })
    }

    return NextResponse.json({ data: data || [] }, { headers })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://swyft-housing.vercel.app",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
