"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Bed, Bath, Square, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/empty-state"

interface VacantUnit {
  id: string
  title: string
  location: string
  rent: number
  selling_price?: number
  bedrooms: number
  bathrooms: number
  size: number
  type: "rent" | "sale" | "both"
  status: "available" | "pending" | "rented"
  images: string[]
  description: string
  amenities: string[]
  available_from: string
  created_at: string
}

// Format currency in KSH
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function VacantUnitsPage() {
  const [units, setUnits] = useState<VacantUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchVacantUnits()
  }, [])

  const fetchVacantUnits = async () => {
    try {
      const response = await fetch("/api/vacant-units")
      if (response.ok) {
        const data = await response.json()
        setUnits(data)
      } else {
        // Fallback to sample data
        setUnits([
          {
            id: "1",
            title: "Modern 2BR Apartment in Westlands",
            location: "Westlands, Nairobi",
            rent: 85000,
            selling_price: 12000000,
            bedrooms: 2,
            bathrooms: 2,
            size: 120,
            type: "both",
            status: "available",
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Spacious modern apartment with great amenities",
            amenities: ["Parking", "Security", "Gym", "Swimming Pool"],
            available_from: "2024-02-01",
            created_at: "2024-01-15T10:00:00Z",
          },
          {
            id: "2",
            title: "Luxury 3BR Penthouse in Kilimani",
            location: "Kilimani, Nairobi",
            rent: 150000,
            bedrooms: 3,
            bathrooms: 3,
            size: 180,
            type: "rent",
            status: "available",
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Luxury penthouse with panoramic city views",
            amenities: ["Parking", "Security", "Gym", "Balcony", "City View"],
            available_from: "2024-02-15",
            created_at: "2024-01-10T14:30:00Z",
          },
          {
            id: "3",
            title: "Cozy 1BR Studio in Karen",
            location: "Karen, Nairobi",
            rent: 45000,
            selling_price: 6500000,
            bedrooms: 1,
            bathrooms: 1,
            size: 65,
            type: "both",
            status: "pending",
            images: ["/placeholder.svg?height=200&width=300"],
            description: "Perfect starter home in quiet neighborhood",
            amenities: ["Parking", "Security", "Garden"],
            available_from: "2024-03-01",
            created_at: "2024-01-20T09:15:00Z",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching vacant units:", error)
      setUnits([])
    } finally {
      setLoading(false)
    }
  }

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      unit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || unit.type === filterType
    const matchesStatus = filterStatus === "all" || unit.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rented":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rent":
        return "bg-blue-100 text-blue-800"
      case "sale":
        return "bg-purple-100 text-purple-800"
      case "both":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vacant Units</h2>
          <p className="text-muted-foreground">Manage your available properties</p>
        </div>
        <Link href="/new-vacant-unit">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="both">Rent & Sale</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <EmptyState
          title="No vacant units found"
          description="Start by adding your first vacant unit to the system."
          actionLabel="Add Unit"
          actionHref="/new-vacant-unit"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={unit.images[0] || "/placeholder.svg?height=200&width=300"}
                  alt={unit.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge className={getStatusColor(unit.status)}>{unit.status}</Badge>
                  <Badge className={getTypeColor(unit.type)}>{unit.type === "both" ? "Rent/Sale" : unit.type}</Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{unit.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {unit.location}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Bed className="mr-1 h-4 w-4" />
                      {unit.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="mr-1 h-4 w-4" />
                      {unit.bathrooms}
                    </div>
                    <div className="flex items-center">
                      <Square className="mr-1 h-4 w-4" />
                      {unit.size}m²
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {unit.type === "rent" || unit.type === "both" ? (
                    <div className="text-lg font-bold text-green-600">{formatCurrency(unit.rent)}/month</div>
                  ) : null}
                  {unit.type === "sale" || (unit.type === "both" && unit.selling_price) ? (
                    <div className="text-lg font-bold text-purple-600">{formatCurrency(unit.selling_price || 0)}</div>
                  ) : null}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>

                <div className="flex flex-wrap gap-1">
                  {unit.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {unit.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{unit.amenities.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
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
