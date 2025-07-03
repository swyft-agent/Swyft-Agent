import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("company_id")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 })
    }

    // Get buildings count
    const { data: buildings, error: buildingsError } = await supabase
      .from("buildings")
      .select("building_id")
      .eq("company_account_id", companyId)

    // Get vacant units
    const { data: vacantUnits, error: vacantError } = await supabase
      .from("vacant_units")
      .select("*")
      .eq("company_account_id", companyId)

    // Get inquiries
    const { data: inquiries, error: inquiriesError } = await supabase
      .from("inquiries")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    // Calculate stats
    const totalBuildings = buildings?.length || 0
    const totalUnits = vacantUnits?.length || 0
    const forRent = vacantUnits?.filter((unit) => unit.category === "for rent") || []
    const forSale = vacantUnits?.filter((unit) => unit.category === "for sale") || []
    const occupiedUnits = Math.max(0, totalUnits - (forRent.length + forSale.length))
    const pendingInquiries =
      inquiries?.filter((inq) => inq.status === "new" || inq.status === "in-progress")?.length || 0

    const avgRent =
      forRent.length > 0 ? forRent.reduce((sum, unit) => sum + (unit.rent_amount || 0), 0) / forRent.length : 0

    const avgSalePrice =
      forSale.length > 0 ? forSale.reduce((sum, unit) => sum + (unit.selling_price || 0), 0) / forSale.length : 0

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

    const stats = {
      totalBuildings,
      totalUnits,
      vacantUnits: forRent.length + forSale.length,
      occupiedUnits,
      totalTenants: occupiedUnits,
      pendingInquiries,
      monthlyRevenue: avgRent * forRent.length,
      occupancyRate,
      revenueChange: 0,
      inquiriesChange: 0,
      recent_inquiries:
        inquiries?.slice(0, 3).map((inq) => ({
          id: inq.id,
          name: inq.name,
          subject: inq.subject,
          created_at: inq.created_at,
        })) || [],
      recent_notices: [],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
