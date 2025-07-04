import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const ALLOWED_ORIGIN = "https://swyft-housing.vercel.app"

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  if (!uuid || uuid === "null" || uuid === "undefined" || uuid.trim() === "") {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

// Validate origin for extra security
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  return origin === ALLOWED_ORIGIN || !origin // Allow requests without origin (direct API calls)
}

// Handle preflight requests
export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET(request: NextRequest) {
  try {
    // Validate origin
    if (!validateOrigin(request)) {
      const response = NextResponse.json({ error: "Forbidden: Invalid origin" }, { status: 403 })
      return addCorsHeaders(response)
    }

    // Public endpoint - no authentication required
    // Return all available vacant units with all fields
    const { data: vacantUnits, error } = await supabase
      .from("vacant_units")
      .select(`
        id,
        company_account_id,
        title,
        description,
        property_type,
        bedrooms,
        bathrooms,
        square_feet,
        rent_amount,
        deposit_amount,
        address,
        city,
        state,
        zip_code,
        latitude,
        longitude,
        amenities,
        pet_policy,
        parking_available,
        utilities_included,
        images,
        virtual_tour_url,
        status,
        featured,
        created_at,
        updated_at,
        created_by,
        contact_info,
        building_id,
        viewing_fee,
        house_number,
        frequency,
        role,
        available_from,
        selling_price,
        category,
        user_id,
        building_name
      `)
      .eq("status", "available")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      const response = NextResponse.json(
        {
          error: "Failed to fetch vacant units",
          details: error.message,
        },
        { status: 500 },
      )
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      data: vacantUnits || [],
      count: vacantUnits?.length || 0,
      message: "Vacant units retrieved successfully",
    })

    return addCorsHeaders(response)
  } catch (error) {
    console.error("API error:", error)
    const response = NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate origin
    if (!validateOrigin(request)) {
      const response = NextResponse.json({ error: "Forbidden: Invalid origin" }, { status: 403 })
      return addCorsHeaders(response)
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.rent_amount) {
      const response = NextResponse.json(
        {
          error: "Validation failed",
          details: "Title and rent amount are required",
        },
        { status: 400 },
      )
      return addCorsHeaders(response)
    }

    // Set default values for required fields
    const vacantUnitData = {
      title: body.title,
      description: body.description || null,
      property_type: body.property_type || "apartment",
      bedrooms: body.bedrooms || 0,
      bathrooms: body.bathrooms || 0,
      square_feet: body.square_feet || 0,
      rent_amount: body.rent_amount,
      deposit_amount: body.deposit_amount || 0,
      address: body.address || "",
      city: body.city || "",
      state: body.state || "",
      zip_code: body.zip_code || "",
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      amenities: body.amenities || [],
      pet_policy: body.pet_policy || null,
      parking_available: body.parking_available || false,
      utilities_included: body.utilities_included || [],
      images: body.images || [],
      virtual_tour_url: body.virtual_tour_url || null,
      status: "available",
      featured: body.featured || false,
      contact_info: body.contact_info || "",
      building_id: body.building_id || null,
      viewing_fee: body.viewing_fee || 0,
      house_number: body.house_number || "",
      frequency: body.frequency || 1,
      role: body.role || "agent",
      available_from: body.available_from || new Date().toISOString().split("T")[0],
      selling_price: body.selling_price || 0,
      category: body.category || "for rent",
      user_id: body.user_id || null,
      building_name: body.building_name || null,
      company_account_id: body.company_account_id || null,
      created_by: body.created_by || null,
    }

    const { data: vacantUnit, error } = await supabase
      .from("vacant_units")
      .insert([vacantUnitData])
      .select(`
        id,
        company_account_id,
        title,
        description,
        property_type,
        bedrooms,
        bathrooms,
        square_feet,
        rent_amount,
        deposit_amount,
        address,
        city,
        state,
        zip_code,
        latitude,
        longitude,
        amenities,
        pet_policy,
        parking_available,
        utilities_included,
        images,
        virtual_tour_url,
        status,
        featured,
        created_at,
        updated_at,
        created_by,
        contact_info,
        building_id,
        viewing_fee,
        house_number,
        frequency,
        role,
        available_from,
        selling_price,
        category,
        user_id,
        building_name
      `)
      .single()

    if (error) {
      console.error("Database error:", error)
      const response = NextResponse.json(
        {
          error: "Failed to create vacant unit",
          details: error.message,
        },
        { status: 500 },
      )
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      data: vacantUnit,
      message: "Vacant unit created successfully",
    })

    return addCorsHeaders(response)
  } catch (error) {
    console.error("API error:", error)
    const response = NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
    return addCorsHeaders(response)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate origin
    if (!validateOrigin(request)) {
      const response = NextResponse.json({ error: "Forbidden: Invalid origin" }, { status: 403 })
      return addCorsHeaders(response)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id || !isValidUUID(id)) {
      const response = NextResponse.json(
        {
          error: "Validation failed",
          details: "Valid ID is required",
        },
        { status: 400 },
      )
      return addCorsHeaders(response)
    }

    const body = await request.json()

    // Remove fields that shouldn't be updated
    const { id: bodyId, created_at, ...updateData } = body
    updateData.updated_at = new Date().toISOString()

    const { data: vacantUnit, error } = await supabase
      .from("vacant_units")
      .update(updateData)
      .eq("id", id)
      .select(`
        id,
        company_account_id,
        title,
        description,
        property_type,
        bedrooms,
        bathrooms,
        square_feet,
        rent_amount,
        deposit_amount,
        address,
        city,
        state,
        zip_code,
        latitude,
        longitude,
        amenities,
        pet_policy,
        parking_available,
        utilities_included,
        images,
        virtual_tour_url,
        status,
        featured,
        created_at,
        updated_at,
        created_by,
        contact_info,
        building_id,
        viewing_fee,
        house_number,
        frequency,
        role,
        available_from,
        selling_price,
        category,
        user_id,
        building_name
      `)
      .single()

    if (error) {
      console.error("Database error:", error)
      const response = NextResponse.json(
        {
          error: "Failed to update vacant unit",
          details: error.message,
        },
        { status: 500 },
      )
      return addCorsHeaders(response)
    }

    if (!vacantUnit) {
      const response = NextResponse.json(
        {
          error: "Not found",
          details: "Vacant unit not found",
        },
        { status: 404 },
      )
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      data: vacantUnit,
      message: "Vacant unit updated successfully",
    })

    return addCorsHeaders(response)
  } catch (error) {
    console.error("API error:", error)
    const response = NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
    return addCorsHeaders(response)
  }
}
