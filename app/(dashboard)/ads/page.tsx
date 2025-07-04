"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, Edit, Trash2, TrendingUp, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface Ad {
  id: string
  title: string
  description: string
  property_id: string
  property_title: string
  location: string
  budget: number
  status: "active" | "paused" | "completed"
  clicks: number
  impressions: number
  created_at: string
  expires_at: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function AdsPage() {
  const { user } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (user?.id) {
      fetchAds()
    }
  }, [user?.id])

  const fetchAds = async () => {
    try {
      setLoading(true)

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from("ads")
        .select(`
          *,
          vacant_units!inner(title, address, city)
        `)
        .eq("company_account_id", userData.company_account_id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedAds = (data || []).map((ad: any) => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        property_id: ad.property_id,
        property_title: ad.vacant_units?.title || "Unknown Property",
        location: `${ad.vacant_units?.address || ""}, ${ad.vacant_units?.city || ""}`.trim(),
        budget: ad.budget || 0,
        status: ad.status,
        clicks: ad.clicks || 0,
        impressions: ad.impressions || 0,
        created_at: ad.created_at,
        expires_at: ad.expires_at,
      }))

      setAds(formattedAds)
    } catch (error) {
      console.error("Error fetching ads:", error)
      setAds([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.property_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ad.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return

    try {
      const { error } = await supabase.from("ads").delete().eq("id", adId)
      if (error) throw error

      setAds(ads.filter((ad) => ad.id !== adId))
    } catch (error) {
      console.error("Error deleting ad:", error)
      alert("Failed to delete ad")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Ad
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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

  return (
    <div className="space-y-6 bg-white min-h-screen p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
          <p className="text-gray-600 mt-1">
            {filteredAds.length} {filteredAds.length === 1 ? "ad" : "ads"} found
          </p>
        </div>
        <Link href="/ads/create">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Ad
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search ads by title, property, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAds.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <TrendingUp className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ads found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first ad campaign"}
          </p>
          <Link href="/ads/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Ad
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <Card key={ad.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{ad.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{ad.property_title}</p>
                  </div>
                  <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="line-clamp-1">{ad.location}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Budget</p>
                    <p className="font-semibold">{formatCurrency(ad.budget)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Clicks</p>
                    <p className="font-semibold">{ad.clicks.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Impressions</p>
                    <p className="font-semibold">{ad.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CTR</p>
                    <p className="font-semibold">
                      {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00"}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Expires: {new Date(ad.expires_at).toLocaleDateString()}</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDeleteAd(ad.id)}
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
