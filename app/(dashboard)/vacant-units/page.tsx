"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MapPin, Bed, Bath, Square, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { fetchVacantUnits } from "@/lib/supabase-data"

interface VacantUnit {
  id: string
  title: string
  description: string
  property_type: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  rent_amount: number
  selling_price: number
  address: string
  city: string
  state: string
  images: string[]
  status: string
  category: string
  created_at: string
  building_name: string
  amenities: string[]
  available_from: string
}

export default function VacantUnitsPage() {
  const { user } = useAuth()
  const [units, setUnits] = useState<VacantUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    if (user?.id) {
      loadVacantUnits()
    }
  }, [user?.id])

  const loadVacantUnits = async () => {
    try {
      setLoading(true)
      const data = await fetchVacantUnits()
      setUnits(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading vacant units:", error)
      setUnits([])
    } finally {
      setLoading(false)
    }
  }

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || unit.status === filterStatus
    const matchesType = filterType === "all" || unit.property_type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Vacant Units</h1>
          <Button asChild>
            <Link href="/new-vacant-unit">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Vacant Units</h1>
          <p className="text-gray-600 mt-1">Manage your available properties</p>
        </div>
        <Button asChild>
          <Link href="/new-vacant-unit">
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title, address, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vacant units found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all" || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first vacant unit"}
              </p>
              <Button asChild>
                <Link href="/new-vacant-unit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Unit
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={unit.images?.[0] || "/placeholder.svg?height=200&width=300"}
                  alt={unit.title}
                  className="w-full h-48 object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    unit.status === "available"
                      ? "bg-green-500"
                      : unit.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                >
                  {unit.status}
                </Badge>
                {unit.category && <Badge className="absolute top-2 left-2 bg-blue-500">{unit.category}</Badge>}
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{unit.title}</h3>

                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">
                      {unit.address}, {unit.city}
                    </span>
                  </div>

                  {unit.building_name && <p className="text-sm text-gray-600">Building: {unit.building_name}</p>}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {unit.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {unit.bathrooms}
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {unit.square_feet} sq ft
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {unit.category === "for sale" ? (
                        <p className="text-lg font-bold text-green-600">{formatCurrency(unit.selling_price)}</p>
                      ) : (
                        <p className="text-lg font-bold text-green-600">{formatCurrency(unit.rent_amount)}/month</p>
                      )}
                      <p className="text-xs text-gray-500 capitalize">{unit.property_type}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {unit.amenities && unit.amenities.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1">
                        {unit.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {unit.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{unit.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {unit.available_from && (
                    <p className="text-xs text-gray-500">
                      Available from: {new Date(unit.available_from).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
