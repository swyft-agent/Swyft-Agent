"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowLeft, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface VacantUnit {
  id: string
  title: string
  address: string
  city: string
  rent_amount: string
  bedrooms: number
  bathrooms: number
}

export default function CreateAdPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [vacantUnits, setVacantUnits] = useState<VacantUnit[]>([])
  const [expiryDate, setExpiryDate] = useState<Date>()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_id: "",
    budget: "",
    target_audience: "all",
    ad_type: "promotion",
  })

  useEffect(() => {
    if (user?.id) {
      fetchVacantUnits()
    }
  }, [user?.id])

  const fetchVacantUnits = async () => {
    try {
      // Get user's company ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      // Fetch only vacant units belonging to the current user's company
      const { data, error } = await supabase
        .from("vacant_units")
        .select("id, title, address, city, rent_amount, bedrooms, bathrooms")
        .eq("company_account_id", userData.company_account_id)
        .eq("status", "available")
        .order("created_at", { ascending: false })

      if (error) throw error
      setVacantUnits(data || [])
    } catch (error) {
      console.error("Error fetching vacant units:", error)
      setError("Failed to load your vacant units")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!expiryDate) {
      setError("Please select an expiry date")
      return
    }

    if (!formData.property_id) {
      setError("Please select a vacant unit to promote")
      return
    }

    if (Number.parseFloat(formData.budget) < 100) {
      setError("Minimum budget is KSh 100")
      return
    }

    setLoading(true)

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      // Create the ad
      const { error: adError } = await supabase.from("ads").insert([
        {
          title: formData.title,
          description: formData.description,
          property_id: formData.property_id,
          budget: Number.parseFloat(formData.budget),
          target_audience: formData.target_audience,
          ad_type: formData.ad_type,
          expires_at: expiryDate.toISOString(),
          status: "active",
          company_account_id: userData.company_account_id,
          created_by: user.id,
        },
      ])

      if (adError) throw adError

      router.push("/ads")
    } catch (error: any) {
      console.error("Error creating ad:", error)
      setError(error.message || "Failed to create ad. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Link href="/ads">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ads
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ad</h1>
          <p className="text-gray-600 mt-1">Promote your vacant units to reach more potential tenants</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {vacantUnits.length === 0 && !loading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have any available vacant units to promote. Please add a vacant unit first.
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Ad Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="property">Select Vacant Unit *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vacant unit to promote" />
                </SelectTrigger>
                <SelectContent>
                  {vacantUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{unit.title}</span>
                        <span className="text-sm text-gray-500">
                          {unit.address}, {unit.city} • {unit.bedrooms}BR/{unit.bathrooms}BA • KSh{" "}
                          {Number(unit.rent_amount || 0).toLocaleString()}/month
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">Only your available vacant units are shown</p>
            </div>

            <div>
              <Label htmlFor="title">Ad Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Luxury 2BR Apartment in Westlands"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what makes this property special..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget (KSh) *</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="5000"
                min="100"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Minimum budget is KSh 100</p>
            </div>

            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="professionals">Young Professionals</SelectItem>
                  <SelectItem value="families">Families</SelectItem>
                  <SelectItem value="executives">Executives</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ad_type">Ad Type</Label>
              <Select value={formData.ad_type} onValueChange={(value) => setFormData({ ...formData, ad_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="featured">Featured Listing</SelectItem>
                  <SelectItem value="urgent">Urgent Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expiry Date *</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : <span>Pick an expiry date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={(date) => {
                      setExpiryDate(date)
                      setCalendarOpen(false)
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || vacantUnits.length === 0} className="flex-1">
                {loading ? "Creating..." : "Create Ad"}
              </Button>
              <Link href="/ads">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
