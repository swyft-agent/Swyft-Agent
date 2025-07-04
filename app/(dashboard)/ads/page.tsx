"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, MousePointer, TrendingUp, MoreHorizontal, Play, Pause, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface Ad {
  id: string
  title: string
  description: string
  budget: number
  target_audience: string
  ad_type: string
  status: string
  clicks: number
  impressions: number
  conversions: number
  expires_at: string
  created_at: string
  vacant_units: {
    title: string
    address: string
    city: string
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "paused":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-blue-100 text-blue-800"
    case "expired":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function AdsPage() {
  const { user } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    totalClicks: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    if (user?.id) {
      fetchAds()
    }
  }, [user?.id])

  const fetchAds = async () => {
    try {
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
          vacant_units (
            title,
            address,
            city
          )
        `)
        .eq("company_account_id", userData.company_account_id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setAds(data || [])

      // Calculate stats
      const totalAds = data?.length || 0
      const activeAds = data?.filter((ad) => ad.status === "active").length || 0
      const totalClicks = data?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0
      const totalSpent = data?.reduce((sum, ad) => sum + (ad.budget || 0), 0) || 0

      setStats({
        totalAds,
        activeAds,
        totalClicks,
        totalSpent,
      })
    } catch (error) {
      console.error("Error fetching ads:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateAdStatus = async (adId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("ads").update({ status: newStatus }).eq("id", adId)

      if (error) throw error

      // Refresh ads list
      fetchAds()
    } catch (error) {
      console.error("Error updating ad status:", error)
    }
  }

  const deleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return

    try {
      const { error } = await supabase.from("ads").delete().eq("id", adId)

      if (error) throw error

      // Refresh ads list
      fetchAds()
    } catch (error) {
      console.error("Error deleting ad:", error)
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Ad
          </Button>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
          <p className="text-gray-600 mt-1">Manage your property advertisements</p>
        </div>
        <Link href="/ads/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Ad
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAds}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Advertisements</CardTitle>
        </CardHeader>
        <CardContent>
          {ads.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ads yet</h3>
              <p className="text-gray-600 mb-4">Create your first ad to start promoting your vacant units</p>
              <Link href="/ads/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Ad
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <Badge className={getStatusColor(ad.status)}>{ad.status}</Badge>
                        <Badge variant="outline">{ad.ad_type}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{ad.description}</p>
                      <div className="text-sm text-gray-500 mb-3">
                        <strong>Property:</strong> {ad.vacant_units?.title} - {ad.vacant_units?.address},{" "}
                        {ad.vacant_units?.city}
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span>Budget: {formatCurrency(ad.budget)}</span>
                        <span>Clicks: {ad.clicks}</span>
                        <span>Impressions: {ad.impressions}</span>
                        <span>Conversions: {ad.conversions}</span>
                        <span>Expires: {new Date(ad.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {ad.status === "active" ? (
                          <DropdownMenuItem onClick={() => updateAdStatus(ad.id, "paused")}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Ad
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => updateAdStatus(ad.id, "active")}>
                            <Play className="mr-2 h-4 w-4" />
                            Resume Ad
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteAd(ad.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Ad
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
