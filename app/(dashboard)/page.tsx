"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  Home,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Plus,
  Eye,
  RefreshCw,
  Calendar,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { fetchDashboardStats, fetchVacantUnits, fetchInquiries, fetchNotices } from "@/lib/supabase-data"
import { shouldShowSampleData } from "@/lib/environment"
import EmptyState from "@/components/empty-state"

interface DashboardStats {
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUnits, setRecentUnits] = useState<any[]>([])
  const [recentInquiries, setRecentInquiries] = useState<any[]>([])
  const [recentNotices, setRecentNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)

  useEffect(() => {
    setShowSampleData(shouldShowSampleData())
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (shouldShowSampleData()) {
        // Use sample data for preview
        setStats({
          totalBuildings: 12,
          totalUnits: 156,
          occupiedUnits: 142,
          vacantUnits: 14,
          occupancyRate: 91,
          monthlyRevenue: 2850000,
          totalRevenue: 34200000,
          pendingInquiries: 8,
          activeNotices: 3,
          totalTenants: 142,
          revenueChange: 12.5,
          inquiriesChange: -5.2,
        })
        setRecentUnits([
          {
            id: "1",
            property_name: "Luxury 2BR Apartment",
            location: "Westlands, Nairobi",
            rent_amount: 85000,
            category: "rent",
            status: "available",
          },
          {
            id: "2",
            property_name: "Modern Studio",
            location: "Kilimani, Nairobi",
            rent_amount: 45000,
            category: "rent",
            status: "available",
          },
        ])
        setRecentInquiries([
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            property: "Luxury 2BR Apartment",
            status: "pending",
            created_at: "2024-01-15",
          },
        ])
        setRecentNotices([
          {
            id: "1",
            title: "Maintenance Notice",
            type: "maintenance",
            status: "active",
            created_at: "2024-01-14",
          },
        ])
      } else {
        // Fetch real data
        const [statsData, unitsData, inquiriesData, noticesData] = await Promise.all([
          fetchDashboardStats(),
          fetchVacantUnits(),
          fetchInquiries(),
          fetchNotices(),
        ])

        setStats(statsData)
        setRecentUnits(unitsData.slice(0, 5))
        setRecentInquiries(inquiriesData.slice(0, 5))
        setRecentNotices(noticesData.slice(0, 5))
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Button disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <EmptyState
          icon={Building2}
          title="Welcome to Swyft Agent"
          description="Get started by adding your first building or property."
          action={
            <Button asChild>
              <Link href="/new-building">
                <Plus className="mr-2 h-4 w-4" />
                Add Building
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/new-building">
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBuildings || 0}</div>
            <p className="text-xs text-muted-foreground">Properties in portfolio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.vacantUnits || 0} vacant • {stats.occupiedUnits || 0} occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.occupancyRate || 0)}%</div>
            <p className="text-xs text-muted-foreground">{stats.totalTenants || 0} active tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueChange >= 0 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+{stats.revenueChange.toFixed(1)}% from last month
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {stats.revenueChange.toFixed(1)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Vacant Units</CardTitle>
            <CardDescription>Latest properties available for rent or sale</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUnits.length === 0 ? (
              <EmptyState
                icon={Home}
                title="No vacant units"
                description="Add your first vacant unit to get started."
                action={
                  <Button asChild size="sm">
                    <Link href="/new-vacant-unit">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Unit
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {recentUnits.map((unit) => (
                  <div key={unit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{unit.property_name}</p>
                      <p className="text-sm text-muted-foreground">{unit.location}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={unit.category === "rent" ? "default" : "secondary"}>
                          {unit.category === "rent" ? "For Rent" : "For Sale"}
                        </Badge>
                        <Badge variant="outline">{unit.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(unit.rent_amount || unit.selling_price || 0)}</p>
                      {unit.category === "rent" && <p className="text-sm text-muted-foreground">/month</p>}
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/vacant-units">
                      <Eye className="mr-2 h-4 w-4" />
                      View All Units
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest inquiries and notices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Inquiries Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Inquiries</h4>
                  <Badge variant="outline">{stats.pendingInquiries || 0} pending</Badge>
                </div>
                {recentInquiries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent inquiries</p>
                ) : (
                  <div className="space-y-2">
                    {recentInquiries.slice(0, 2).map((inquiry) => (
                      <div key={inquiry.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{inquiry.name}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.property}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {inquiry.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notices Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Notices</h4>
                  <Badge variant="outline">{stats.activeNotices || 0} active</Badge>
                </div>
                {recentNotices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active notices</p>
                ) : (
                  <div className="space-y-2">
                    {recentNotices.slice(0, 2).map((notice) => (
                      <div key={notice.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{notice.title}</p>
                            <p className="text-xs text-muted-foreground">{notice.type}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {notice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/inquiries">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View All Inquiries
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/notices">
                    <Calendar className="mr-2 h-4 w-4" />
                    View All Notices
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/new-building">
                <Building2 className="h-6 w-6 mb-2" />
                Add Building
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/new-vacant-unit">
                <Home className="h-6 w-6 mb-2" />
                Add Vacant Unit
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/tenants">
                <Users className="h-6 w-6 mb-2" />
                Manage Tenants
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/finances">
                <DollarSign className="h-6 w-6 mb-2" />
                View Finances
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
