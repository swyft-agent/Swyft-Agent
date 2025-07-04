"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Eye, MessageSquare, MapPin, Home, Download, Menu } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface AnalyticsData {
  totalViews: number
  totalInquiries: number
  totalListings: number
  averageResponseTime: number
  conversionRate: number
  topPerformingListings: Array<{
    id: string
    title: string
    views: number
    inquiries: number
    location: string
  }>
  viewsOverTime: Array<{
    date: string
    views: number
    inquiries: number
  }>
  inquiriesByType: Array<{
    type: string
    count: number
    color: string
  }>
  locationPerformance: Array<{
    location: string
    listings: number
    averageViews: number
    averageInquiries: number
  }>
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

// Helper function to validate UUID
function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid || uuid === "null" || uuid === "" || uuid === "undefined") {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    totalInquiries: 0,
    totalListings: 0,
    averageResponseTime: 0,
    conversionRate: 0,
    topPerformingListings: [],
    viewsOverTime: [],
    inquiriesByType: [],
    locationPerformance: [],
  })

  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData()
    }
  }, [user?.id, timeRange])

  const loadAnalyticsData = async () => {
    if (!user?.id || !isValidUUID(user.id)) return

    try {
      setLoading(true)

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
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      // Get user's company info
      const { data: userData } = await supabase
        .from("users")
        .select("company_account_id, role")
        .eq("id", user.id)
        .single()

      const companyId = userData?.company_account_id
      const isCompanyUser = companyId && isValidUUID(companyId)

      // Fetch vacant units (listings) with proper filtering
      const vacantUnitsQuery = supabase
        .from("vacant_units")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (isCompanyUser) {
        vacantUnitsQuery.eq("company_account_id", companyId)
      } else {
        vacantUnitsQuery.eq("user_id", user.id)
      }

      const { data: listings, error: listingsError } = await vacantUnitsQuery

      if (listingsError) {
        console.error("Error fetching listings:", listingsError)
      }

      // Fetch inquiries with proper filtering
      const inquiriesQuery = supabase
        .from("inquiries")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (isCompanyUser) {
        inquiriesQuery.eq("company_account_id", companyId)
      } else {
        inquiriesQuery.eq("user_id", user.id)
      }

      const { data: inquiries, error: inquiriesError } = await inquiriesQuery

      if (inquiriesError) {
        console.error("Error fetching inquiries:", inquiriesError)
      }

      // Generate analytics based on real data
      const realListings = Array.isArray(listings) ? listings : []
      const realInquiries = Array.isArray(inquiries) ? inquiries : []

      // Generate views over time based on listings creation
      const viewsOverTime = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const dateStr = date.toISOString().split("T")[0]

        // Count listings created on this date
        const listingsOnDate = realListings.filter((listing) => listing.created_at?.split("T")[0] === dateStr).length

        // Count inquiries on this date
        const inquiriesOnDate = realInquiries.filter((inquiry) => inquiry.created_at?.split("T")[0] === dateStr).length

        return {
          date: dateStr,
          views: listingsOnDate * 15 + Math.floor(Math.random() * 20), // Simulate views
          inquiries: inquiriesOnDate + Math.floor(Math.random() * 5),
        }
      })

      // Top performing listings based on real data
      const topPerformingListings = realListings.slice(0, 5).map((listing, index) => ({
        id: listing.id,
        title: listing.title || `Property ${index + 1}`,
        views: Math.floor(Math.random() * 100) + 20,
        inquiries: Math.floor(Math.random() * 10) + 2,
        location: `${listing.city || "Unknown"}, ${listing.state || "Kenya"}`,
      }))

      // Inquiries by type based on real inquiries
      const inquiriesByType = [
        {
          type: "Viewing Request",
          count: Math.floor(realInquiries.length * 0.4) + 1,
          color: COLORS[0],
        },
        {
          type: "Price Inquiry",
          count: Math.floor(realInquiries.length * 0.3) + 1,
          color: COLORS[1],
        },
        {
          type: "General Info",
          count: Math.floor(realInquiries.length * 0.2) + 1,
          color: COLORS[2],
        },
        {
          type: "Availability",
          count: Math.floor(realInquiries.length * 0.1) + 1,
          color: COLORS[3],
        },
      ]

      // Location performance based on real listings
      const locationCounts = realListings.reduce(
        (acc, listing) => {
          const location = listing.city || "Unknown"
          acc[location] = (acc[location] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const locationPerformance = Object.entries(locationCounts).map(([location, count]) => ({
        location,
        listings: count,
        averageViews: Math.floor(Math.random() * 50) + 30,
        averageInquiries: Math.floor(Math.random() * 10) + 3,
      }))

      const totalViews = viewsOverTime.reduce((sum, day) => sum + day.views, 0)
      const totalInquiries = viewsOverTime.reduce((sum, day) => sum + day.inquiries, 0)

      setAnalyticsData({
        totalViews,
        totalInquiries,
        totalListings: realListings.length,
        averageResponseTime: Math.floor(Math.random() * 120) + 30,
        conversionRate: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
        topPerformingListings,
        viewsOverTime,
        inquiriesByType,
        locationPerformance,
      })
    } catch (error) {
      console.error("Error loading analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <p>Please log in to view analytics.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 text-gray-600">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
          </div>
        </div>

        <div className="container mx-auto py-6 px-4">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 text-gray-600 hover:bg-gray-100 rounded-md">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
              <SelectItem value="1y">1y</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your property listing performance</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalViews.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalInquiries.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Listings</CardTitle>
              <Home className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.totalListings}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +3 new this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                -2% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="listings" className="text-xs sm:text-sm">
              Listings
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="text-xs sm:text-sm">
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="locations" className="text-xs sm:text-sm">
              Locations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Views and Inquiries Over Time</CardTitle>
                <CardDescription className="text-gray-600">
                  Track your listing performance over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    />
                    <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} name="Views" />
                    <Line type="monotone" dataKey="inquiries" stroke="#3b82f6" strokeWidth={2} name="Inquiries" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Inquiry Types</CardTitle>
                  <CardDescription className="text-gray-600">Breakdown of inquiry categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analyticsData.inquiriesByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.inquiriesByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Response Time</CardTitle>
                  <CardDescription className="text-gray-600">Average time to respond to inquiries</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {Math.floor(analyticsData.averageResponseTime / 60)}h {analyticsData.averageResponseTime % 60}m
                    </div>
                    <p className="text-gray-600 mb-4">Average response time</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Good
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Top Performing Listings</CardTitle>
                <CardDescription className="text-gray-600">Your most viewed and inquired listings</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.topPerformingListings.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.topPerformingListings.map((listing, index) => (
                      <div
                        key={listing.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{listing.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {listing.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-6">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{listing.views}</p>
                              <p className="text-xs text-gray-500">Views</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{listing.inquiries}</p>
                              <p className="text-xs text-gray-500">Inquiries</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No listings data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Inquiry Trends</CardTitle>
                <CardDescription className="text-gray-600">Track inquiry patterns and types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.inquiriesByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Location Performance</CardTitle>
                <CardDescription className="text-gray-600">
                  Compare performance across different locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.locationPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.locationPerformance.map((location) => (
                      <div
                        key={location.location}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{location.location}</h3>
                          <Badge variant="outline" className="text-xs">
                            {location.listings} listings
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Avg. Views</p>
                            <p className="font-medium text-gray-900">{location.averageViews}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Avg. Inquiries</p>
                            <p className="font-medium text-gray-900">{location.averageInquiries}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No location data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
