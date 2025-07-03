"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Users, Home, Plus, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { fetchBuildings } from "@/lib/supabase-data"
import EmptyState from "@/components/empty-state"

interface Building {
  building_id: string
  building_name: string
  address: string
  city: string
  state: string
  zip_code: string
  total_units: number
  occupied_units: number
  building_type: string
  year_built: number
  created_at: string
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBuildings()
  }, [])

  const loadBuildings = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Loading buildings...")
      const data = await fetchBuildings()
      console.log("✅ Buildings loaded:", data)
      setBuildings(data || [])
    } catch (err) {
      console.error("❌ Failed to load buildings:", err)
      setError("Failed to load buildings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Buildings</h2>
          <Button disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Buildings</h2>
          <Button onClick={loadBuildings}>
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

  if (buildings.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Buildings</h2>
          <Button asChild>
            <Link href="/new-building">
              <Plus className="mr-2 h-4 w-4" />
              Add Building
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={Building2}
          title="No buildings found"
          description="Get started by adding your first building to the system."
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Buildings</h2>
          <p className="text-muted-foreground">Manage your property portfolio ({buildings.length} buildings)</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadBuildings}>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buildings.map((building) => {
          // Ensure we have valid numbers with fallbacks
          const totalUnits = Number(building.total_units) || 0
          const occupiedUnits = Number(building.occupied_units) || 0
          const vacantUnits = Math.max(0, totalUnits - occupiedUnits)

          // Calculate occupancy rate with proper null checks
          const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

          // Ensure occupancy rate is a valid number
          const displayOccupancyRate = isNaN(occupancyRate) ? 0 : occupancyRate

          return (
            <Card key={building.building_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{building.building_name || "Unnamed Building"}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {building.address || "No address"}, {building.city || "No city"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      displayOccupancyRate >= 90 ? "default" : displayOccupancyRate >= 70 ? "secondary" : "destructive"
                    }
                  >
                    {displayOccupancyRate}% occupied
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Total Units</span>
                    </div>
                    <span className="font-medium">{totalUnits}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Occupied</span>
                    </div>
                    <span className="font-medium">{occupiedUnits}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Vacant</span>
                    </div>
                    <span className="font-medium text-orange-600">{vacantUnits}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Type: {building.building_type || "Unknown"}</span>
                      <span>Built: {building.year_built || "Unknown"}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${displayOccupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
