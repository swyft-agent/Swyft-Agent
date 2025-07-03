import { supabase } from "./supabase"

export interface DashboardStats {
  totalBuildings: number
  totalUnits: number
  occupiedUnits: number
  vacantUnits: number
  occupancyRate: number
  monthlyRevenue: number
  totalRevenue: number
  pendingInquiries: number
  activeNotices: number
  totalTenants: number
  revenueChange: number
  inquiriesChange: number
}

// Get user's company ID from the database
export async function getUserCompanyId(): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    // First try to get from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("company_account_id")
      .eq("id", user.id)
      .single()

    if (userData?.company_account_id) {
      return userData.company_account_id
    }

    // If not found, try company_accounts table
    const { data: companyData, error: companyError } = await supabase
      .from("company_accounts")
      .select("company_account_id")
      .eq("owner_id", user.id)
      .single()

    return companyData?.company_account_id || null
  } catch (error) {
    console.error("Error getting user company ID:", error)
    return null
  }
}

// Fetch dashboard stats
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const companyId = await getUserCompanyId()
    if (!companyId) throw new Error("No company ID found")

    const [buildingsResult, unitsResult, tenantsResult] = await Promise.all([
      supabase.from("buildings").select("*").eq("company_account_id", companyId),
      supabase.from("vacant_units").select("*").eq("company_account_id", companyId),
      supabase.from("tenants").select("*").eq("company_account_id", companyId),
    ])

    const buildings = buildingsResult.data || []
    const units = unitsResult.data || []
    const tenants = tenantsResult.data || []

    // Calculate revenue from rent amounts with proper null checks
    const totalRevenue = units.reduce((sum, unit) => {
      const rent = Number.parseFloat(unit.rent_amount || "0")
      return sum + (isNaN(rent) ? 0 : rent)
    }, 0)

    // Calculate vacant and occupied units with proper null checks
    const vacantUnits = units.filter((unit) => unit.status === "available").length
    const occupiedUnits = Math.max(0, units.length - vacantUnits)
    const occupancyRate = units.length > 0 ? (occupiedUnits / units.length) * 100 : 0

    // Ensure all values are valid numbers
    const safeOccupancyRate = isNaN(occupancyRate) ? 0 : occupancyRate
    const safeTotalRevenue = isNaN(totalRevenue) ? 0 : totalRevenue

    return {
      totalBuildings: buildings.length,
      totalUnits: units.length,
      vacantUnits: vacantUnits,
      occupiedUnits: occupiedUnits,
      totalTenants: tenants.length,
      pendingInquiries: 0, // TODO: Add inquiries count when available
      activeNotices: 0, // TODO: Add notices count when available
      monthlyRevenue: safeTotalRevenue,
      totalRevenue: safeTotalRevenue,
      occupancyRate: safeOccupancyRate,
      revenueChange: 0, // TODO: Calculate change when historical data is available
      inquiriesChange: 0, // TODO: Calculate change when historical data is available
    }
  } catch (error) {
    console.error("Dashboard stats fetch error:", error)
    // Return safe default values
    return {
      totalBuildings: 0,
      totalUnits: 0,
      vacantUnits: 0,
      occupiedUnits: 0,
      totalTenants: 0,
      pendingInquiries: 0,
      activeNotices: 0,
      monthlyRevenue: 0,
      totalRevenue: 0,
      occupancyRate: 0,
      revenueChange: 0,
      inquiriesChange: 0,
    }
  }
}

// Fetch vacant units
export async function fetchVacantUnits() {
  try {
    const companyId = await getUserCompanyId()
    if (!companyId) throw new Error("No company ID found")

    const { data, error } = await supabase
      .from("vacant_units")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Vacant units fetch error:", error)
    throw error
  }
}

// Fetch buildings
export async function fetchBuildings() {
  try {
    const companyId = await getUserCompanyId()
    if (!companyId) throw new Error("No company ID found")

    const { data, error } = await supabase
      .from("buildings")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Buildings fetch error:", error)
    throw error
  }
}

// Fetch tenants
export async function fetchTenants() {
  try {
    const companyId = await getUserCompanyId()
    if (!companyId) throw new Error("No company ID found")

    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Tenants fetch error:", error)
    throw error
  }
}

// Fetch inquiries
export async function fetchInquiries() {
  try {
    const companyId = await getUserCompanyId()
    if (!companyId) throw new Error("No company ID found")

    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Inquiries fetch error:", error)
    throw error
  }
}

// Fetch notices
export async function fetchNotices() {
  try {
    const companyId = await getUserCompanyId()
    if (!companyId) throw new Error("No company ID found")

    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("company_account_id", companyId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Notices fetch error:", error)
    throw error
  }
}
