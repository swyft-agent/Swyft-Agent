"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Star,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

interface VacantUnit {
  id: string
  property_name: string
  property_type: string
  category: "rent" | "sale"
  rent_amount?: number
  selling_price?: number
  deposit_amount?: number
  viewing_fee?: number
  bedrooms: number
  bathrooms: number
  square_footage?: number
  location: string
  full_address?: string
  description?: string
  amenities?: string[]
  images?: string[]
  available_from?: string
  status: "available" | "pending" | "occupied"
  is_featured: boolean
  created_at: string
}

// Helper functions for safe property access
const getUnitName = (unit: VacantUnit): string => {
  return unit.property_name || unit.property_type || "Unnamed Property"
}

const getUnitLocation = (unit: VacantUnit): string => {
  return unit.full_address || unit.location || "Location not specified"
}

const getUnitSize = (unit: VacantUnit): string => {
  if (unit.square_footage) {
    return `${unit.square_footage} sq ft`
  }
  return "Size not specified"
}

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function VacantUnitsPage() {
  const [units, setUnits] = useState<VacantUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { user } = useAuth()

  const fetchVacantUnits = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's company_account_id
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        throw new Error("Failed to fetch user information")
      }

      const companyId = userData?.company_account_id
      if (!companyId) {
        throw new Error("No company account found for user")
      }

      // Fetch vacant units for the user's company
      const { data, error: unitsError } = await supabase
        .from("vacant_units")
        .select("*")
        .eq("company_account_id", companyId)
        .order("created_at", { ascending: false })

      if (unitsError) {
        console.error("Error fetching vacant units:", unitsError)
        throw new Error("Failed to fetch vacant units")
      }

      console.log("Fetched vacant units:", data)
      setUnits(data || [])
    } catch (err) {
      console.error("Error in fetchVacantUnits:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchVacantUnits()
    }
  }, [user?.id])

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      getUnitName(unit).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUnitLocation(unit).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.property_type || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || unit.category === categoryFilter
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = async (unitId: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) return

    try {
      const { error } = await supabase.from("vacant_units").delete().eq("id", unitId)

      if (error) throw error

      setUnits(units.filter((unit) => unit.id !== unitId))
    } catch (err) {
      console.error("Error deleting unit:", err)
      alert("Failed to delete unit")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Vacant Units</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add New Unit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Units</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchVacantUnits}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vacant Units</h1>
          <p className="text-gray-600 mt-1">
            {filteredUnits.length} {filteredUnits.length === 1 ? "unit" : "units"} available
          </p>
        </div>
        <Link href="/new-vacant-unit">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Unit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, location, or property type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vacant units found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first vacant unit"}
          </p>
          <Link href="/new-vacant-unit">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add New Unit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <Card
              key={unit.id}
              className="hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200"
            >
              <CardHeader className="pb-3">
                {/* Image Section */}
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {unit.images && unit.images.length > 0 ? (
                    <>
                      <img
                        src={unit.images[0] || "/placeholder.svg"}
                        alt={getUnitName(unit)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                      {unit.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {unit.images.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {unit.category === "sale" && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">For Sale</Badge>
                    )}
                    {unit.category === "rent" && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">For Rent</Badge>
                    )}
                    {unit.is_featured && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {getUnitName(unit)}
                  </CardTitle>

                  {/* Property Type */}
                  {unit.property_type && (
                    <Badge variant="outline" className="text-xs">
                      {unit.property_type}
                    </Badge>
                  )}

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{getUnitLocation(unit)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-lg font-bold text-gray-900">
                  {unit.category === "rent" ? (
                    <div>
                      {unit.rent_amount ? (
                        <div>
                          <span>{formatPrice(unit.rent_amount)}/month</span>
                          {unit.deposit_amount && (
                            <div className="text-sm font-normal text-gray-600">
                              Deposit: {formatPrice(unit.deposit_amount)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">Rent on request</span>
                      )}
                    </div>
                  ) : (
                    <div>
                      {unit.selling_price ? (
                        formatPrice(unit.selling_price)
                      ) : (
                        <span className="text-gray-500">Price on request</span>
                      )}
                    </div>
                  )}
                  {unit.viewing_fee && (
                    <div className="text-sm font-normal text-gray-600">
                      Viewing fee: {formatPrice(unit.viewing_fee)}
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>
                      {unit.bedrooms} {unit.bedrooms === 1 ? "bed" : "beds"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>
                      {unit.bathrooms} {unit.bathrooms === 1 ? "bath" : "baths"}
                    </span>
                  </div>
                  {unit.square_footage && (
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{getUnitSize(unit)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {unit.description && <p className="text-sm text-gray-600 line-clamp-2">{unit.description}</p>}

                {/* Amenities */}
                {unit.amenities && unit.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {unit.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {unit.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{unit.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Available Date */}
                {unit.available_from && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Available from {formatDate(unit.available_from)}</span>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={unit.status === "available" ? "default" : "secondary"}
                    className={
                      unit.status === "available"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : unit.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDelete(unit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
