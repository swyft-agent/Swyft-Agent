"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Eye, MousePointer, Users, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface AnalyticsData {
  total_views: number
  total_clicks: number
  total_inquiries: number
  conversion_rate: number
  top_performing_units: Array<{
    id: string
    title: string
    views: number
    clicks: number
    inquiries: number
  }>
  daily_stats: Array<{
    date: string
    views: number
    clicks: number
    inquiries: number
  }>
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    total_views: 0,
    total_clicks: 0,
    total_inquiries: 0,
    conversion_rate: 0,
    top_performing_units: [],
    daily_stats: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData()
    }
  }, [user?.id, timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      switch (timeRange) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7)
          break
        case "30d":
          startDate.setDate(endDate.getDate() - 30)
          break
        case "90d":
          startDate.setDate(endDate.getDate() - 90)
          break
      }

      // Fetch analytics data
      const { data: clickData, error: clickError } = await supabase
        .from("unit_analytics")
        .select(`
          *,
          vacant_units!inner(title, company_account_id)
        `)
        .eq("vacant_units.company_account_id", userData.company_account_id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (clickError) throw clickError

      // Process analytics data
      const totalViews = clickData?.reduce((sum, record) => sum + (record.views || 0), 0) || 0
      const totalClicks = clickData?.reduce((sum, record) => sum + (record.clicks || 0), 0) || 0
      const totalInquiries = clickData?.reduce((sum, record) => sum + (record.inquiries || 0), 0) || 0
      const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0

      // Group by unit for top performers
      const unitStats = new Map()
      clickData?.forEach((record) => {
        const unitId = record.unit_id
        if (!unitStats.has(unitId)) {
          unitStats.set(unitId, {
            id: unitId,
            title: record.vacant_units?.title || "Unknown Unit",
            views: 0,
            clicks: 0,
            inquiries: 0,
          })
        }
        const stats = unitStats.get(unitId)
        stats.views += record.views || 0
        stats.clicks += record.clicks || 0
        stats.inquiries += record.inquiries || 0
      })

      const topPerformingUnits = Array.from(unitStats.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)

      // Group by date for daily stats
      const dailyStatsMap = new Map()
      clickData?.forEach((record) => {
        const date = new Date(record.created_at).toISOString().split("T")[0]
        if (!dailyStatsMap.has(date)) {
          dailyStatsMap.set(date, { date, views: 0, clicks: 0, inquiries: 0 })
        }
        const stats = dailyStatsMap.get(date)
        stats.views += record.views || 0
        stats.clicks += record.clicks || 0
        stats.inquiries += record.inquiries || 0
      })

      const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) => a.date.localeCompare(b.date))

      setAnalyticsData({
        total_views: totalViews,
        total_clicks: totalClicks,
        total_inquiries: totalInquiries,
        conversion_rate: conversionRate,
        top_performing_units: topPerformingUnits,
        daily_stats: dailyStats,
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
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
    <div className="space-y-6 bg-white min-h-screen p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance of your vacant unit listings</p>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.total_views.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.total_clicks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.total_inquiries.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversion_rate.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Top Performing Units</TabsTrigger>
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Units</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.top_performing_units.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                  <p className="text-gray-600">Analytics data will appear here once your units start getting views</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.top_performing_units.map((unit, index) => (
                    <div key={unit.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{unit.title}</p>
                          <p className="text-sm text-gray-500">
                            {unit.views} views • {unit.clicks} clicks • {unit.inquiries} inquiries
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {unit.views > 0 ? ((unit.inquiries / unit.views) * 100).toFixed(1) : "0.0"}%
                        </p>
                        <p className="text-sm text-gray-500">conversion</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.daily_stats.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trend data available</h3>
                  <p className="text-gray-600">Daily trends will appear here as data accumulates</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.daily_stats.map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">
                          {day.views} views • {day.clicks} clicks • {day.inquiries} inquiries
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {day.views > 0 ? ((day.inquiries / day.views) * 100).toFixed(1) : "0.0"}%
                        </p>
                        <p className="text-sm text-gray-500">conversion</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
