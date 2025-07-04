"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Home, Plus, Eye, MessageSquare, Wallet, BarChart3 } from "lucide-react"
import Link from "next/link"

// Format currency in KSH
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatCurrencyShort = (amount: number) => {
  if (amount >= 1000000) {
    return `KSh ${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `KSh ${(amount / 1000).toFixed(0)}K`
  }
  return formatCurrency(amount)
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalUnits: 0,
    vacantUnits: 0,
    recentInquiries: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentVacantUnits, setRecentVacantUnits] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Fallback to sample data
        setStats({
          totalBuildings: 12,
          totalUnits: 156,
          vacantUnits: 14,
          recentInquiries: 23,
        })
      }

      // Fetch recent vacant units
      const vacantResponse = await fetch("/api/vacant-units?limit=3")
      if (vacantResponse.ok) {
        const vacantData = await vacantResponse.json()
        setRecentVacantUnits(vacantData.slice(0, 3))
      } else {
        // Sample data
        setRecentVacantUnits([
          {
            id: 1,
            property_name: "Westlands Apartment",
            unit_number: "2B",
            rent_amount: 85000,
            category: "for rent",
            location: "Westlands, Nairobi",
          },
          {
            id: 2,
            property_name: "Karen Heights",
            unit_number: "12A",
            rent_amount: 120000,
            category: "for rent",
            location: "Karen, Nairobi",
          },
          {
            id: 3,
            property_name: "Kilimani Tower",
            unit_number: "5C",
            rent_amount: 95000,
            category: "for rent",
            location: "Kilimani, Nairobi",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Use sample data on error
      setStats({
        totalBuildings: 12,
        totalUnits: 156,
        vacantUnits: 14,
        recentInquiries: 23,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 ml-0 md:ml-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/new-vacant-unit">
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Stats - Mobile Optimized */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs md:text-sm font-medium">Buildings</CardTitle>
            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg md:text-2xl font-bold">{stats.totalBuildings}</div>
            <p className="text-xs text-muted-foreground">Properties</p>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs md:text-sm font-medium">Total Units</CardTitle>
            <Home className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg md:text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">All units</p>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs md:text-sm font-medium">Vacant</CardTitle>
            <Home className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg md:text-2xl font-bold text-orange-600">{stats.vacantUnits}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card className="p-3 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs md:text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.recentInquiries}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <Link href="/vacant-units">
            <Button variant="outline" className="w-full h-auto p-3 flex flex-col items-center space-y-2 bg-transparent">
              <Home className="h-5 w-5" />
              <span className="text-xs">View Units</span>
            </Button>
          </Link>
          <Link href="/inquiries">
            <Button variant="outline" className="w-full h-auto p-3 flex flex-col items-center space-y-2 bg-transparent">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Inquiries</span>
            </Button>
          </Link>
          <Link href="/wallet">
            <Button variant="outline" className="w-full h-auto p-3 flex flex-col items-center space-y-2 bg-transparent">
              <Wallet className="h-5 w-5" />
              <span className="text-xs">Wallet</span>
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="outline" className="w-full h-auto p-3 flex flex-col items-center space-y-2 bg-transparent">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Vacant Units */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Vacant Units</CardTitle>
            <Link href="/vacant-units">
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentVacantUnits.map((unit: any) => (
            <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{unit.property_name}</p>
                <p className="text-xs text-muted-foreground">
                  Unit {unit.unit_number} • {unit.location}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrencyShort(unit.rent_amount)}</p>
                <Badge variant="secondary" className="text-xs">
                  {unit.category}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">New inquiry for Westlands Apartment 2B</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Unit viewing scheduled for Karen Heights</p>
              <p className="text-xs text-muted-foreground">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Payment received for Kilimani Tower 5C</p>
              <p className="text-xs text-muted-foreground">6 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">New vacant unit listed in Parklands</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
