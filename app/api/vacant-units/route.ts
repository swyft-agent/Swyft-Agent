import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  if (!uuid || uuid === "null" || uuid === "undefined" || uuid.trim() === "") {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

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

    // For public API access, allow without authentication
    if (isPublic) {
      const { data: vacantUnits, error } = await supabase
        .from("vacant_units")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error fetching public vacant units:", error)
        return NextResponse.json({ error: "Failed to fetch vacant units" }, { status: 500, headers })
      }

      return NextResponse.json({ data: vacantUnits }, { headers })
    }

    // For authenticated requests, require either company_id or user_id
    if (!companyId && !userId) {
      return NextResponse.json({ error: "Company ID or User ID required" }, { status: 400, headers })
    }

    let query = supabase.from("vacant_units").select("*").order("created_at", { ascending: false })

    // Filter by company_id if provided and valid
    if (companyId && isValidUUID(companyId)) {
      query = query.eq("company_account_id", companyId)
    }
    // Otherwise filter by user_id if provided and valid
    else if (userId && isValidUUID(userId)) {
      query = query.eq("user_id", userId)
    } else {
      return NextResponse.json({ error: "Valid Company ID or User ID required" }, { status: 400, headers })
    }

    const { data: vacantUnits, error } = await query

    if (error) {
      console.error("Error fetching vacant units:", error)
      return NextResponse.json({ error: "Failed to fetch vacant units" }, { status: 500, headers })
    }

    return NextResponse.json({ data: vacantUnits }, { headers })
  } catch (error) {
    console.error("Vacant units API error:", error)
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
