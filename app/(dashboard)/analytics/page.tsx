"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MousePointer, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface UnitAnalytics {
  id: string
  title: string
  address: string
  city: string
  rent_amount: string
  clicks: number
  views: number
  inquiries: number
  created_at: string
  status: string
}

interface ClickData {
  property_id: string
  clicks_today: number
  clicks_week: number
  clicks_month: number
  last_clicked: string
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [units, setUnits] = useState<UnitAnalytics[]>([])
  const [clickData, setClickData] = useState<ClickData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    totalInquiries: 0,
    conversionRate: 0,
  })
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics()
    }
  }, [user?.id, timeRange])

  const fetchAnalytics = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      // Fetch vacant units with basic analytics
      const { data: unitsData, error: unitsError } = await supabase
        .from("vacant_units")
        .select("id, title, address, city, rent_amount, status, created_at")
        .eq("company_account_id", userData.company_account_id)
        .order("created_at", { ascending: false })

      if (unitsError) throw unitsError

      // Fetch click tracking data for each unit
      const unitIds = unitsData?.map((unit) => unit.id) || []

      if (unitIds.length > 0) {
        const { data: clicksData, error: clicksError } = await supabase
          .from("click_tracking")
          .select("property_id, clicked_at, click_source")
          .in("property_id", unitIds)
          .eq("company_account_id", userData.company_account_id)
          .order("clicked_at", { ascending: false })

        if (clicksError) throw clicksError

        // Process click data
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        const processedClickData = unitIds.map((unitId) => {
          const unitClicks = clicksData?.filter((click) => click.property_id === unitId) || []

          return {
            property_id: unitId,
            clicks_today: unitClicks.filter((click) => new Date(click.clicked_at) >= today).length,
            clicks_week: unitClicks.filter((click) => new Date(click.clicked_at) >= weekAgo).length,
            clicks_month: unitClicks.filter((click) => new Date(click.clicked_at) >= monthAgo).length,
            last_clicked: unitClicks[0]?.clicked_at || "",
          }
        })

        setClickData(processedClickData)

        // Combine units with click data
        const unitsWithAnalytics =
          unitsData?.map((unit) => {
            const unitClickData = processedClickData.find((data) => data.property_id === unit.id)
            return {
              ...unit,
              clicks: unitClickData?.clicks_month || 0,
              views: unitClickData?.clicks_month || 0, // For now, treating clicks as views
              inquiries: 0, // TODO: Add inquiries count when available
            }
          }) || []

        setUnits(unitsWithAnalytics)

        // Calculate overall stats
        const totalClicks = processedClickData.reduce((sum, data) => sum + data.clicks_month, 0)
        const totalViews = totalClicks // For now, treating clicks as views
        const totalInquiries = 0 // TODO: Calculate from inquiries table
        const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0

        setStats({
          totalViews,
          totalClicks,
          totalInquiries,
          conversionRate,
        })
      } else {
        setUnits([])
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(numAmount || 0)
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Track performance of your vacant units</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Views to inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Unit Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Unit Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {units.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">Add some vacant units to start tracking analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              {units.map((unit) => {
                const unitClickData = clickData.find((data) => data.property_id === unit.id)
                return (
                  <div key={unit.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{unit.title}</h3>
                        <p className="text-gray-600">
                          {unit.address}, {unit.city} • {formatCurrency(unit.rent_amount)}/month
                        </p>
                        <Badge
                          className={
                            unit.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {unit.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Today</p>
                        <p className="font-semibold">{unitClickData?.clicks_today || 0} clicks</p>
                      </div>
                      <div>
                        <p className="text-gray-500">This Week</p>
                        <p className="font-semibold">{unitClickData?.clicks_week || 0} clicks</p>
                      </div>
                      <div>
                        <p className="text-gray-500">This Month</p>
                        <p className="font-semibold">{unitClickData?.clicks_month || 0} clicks</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Click</p>
                        <p className="font-semibold">
                          {unitClickData?.last_clicked
                            ? new Date(unitClickData.last_clicked).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
