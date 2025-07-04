"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, User, Phone, Mail, AlertCircle, RefreshCw, MapPin } from "lucide-react"
import { fetchTenants } from "@/lib/supabase-data"

interface Tenant {
  tenant_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  unit_number?: string
  building_name?: string
  lease_start_date?: string
  lease_end_date?: string
  rent_amount?: number
  status: string
  created_at: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Loading tenants...")
      const data = await fetchTenants()
      console.log("✅ Tenants loaded:", data)
      setTenants(data || [])
    } catch (err) {
      console.error("❌ Failed to load tenants:", err)
      setError("Failed to load tenants. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredTenants = tenants.filter((tenant) => {
    const fullName = `${tenant.first_name || ""} ${tenant.last_name || ""}`.trim()
    const email = tenant.email || ""
    const phone = tenant.phone || ""

    const matchesSearch =
      searchTerm === "" ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)

    const matchesStatus = filterStatus === "all" || tenant.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "inactive":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <Button disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
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
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <Button onClick={loadTenants}>
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            {tenants.length} {tenants.length === 1 ? "tenant" : "tenants"} in your properties
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadTenants}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTenants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No tenants found</h3>
              <p className="text-muted-foreground">
                {tenants.length === 0 ? "Start by adding your first tenant." : "Try adjusting your search or filters."}
              </p>
              {tenants.length === 0 && (
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Tenant
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.map((tenant) => {
            const fullName = `${tenant.first_name || ""} ${tenant.last_name || ""}`.trim()

            return (
              <Card key={tenant.tenant_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{fullName}</CardTitle>
                      {tenant.building_name && tenant.unit_number && (
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {tenant.building_name} - Unit {tenant.unit_number}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={getStatusColor(tenant.status)}>{tenant.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {tenant.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-2" />
                          {tenant.email}
                        </div>
                      )}
                      {tenant.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-2" />
                          {tenant.phone}
                        </div>
                      )}
                    </div>

                    {tenant.rent_amount && (
                      <div className="text-lg font-semibold">KSh {tenant.rent_amount.toLocaleString()}/month</div>
                    )}

                    {tenant.lease_start_date && tenant.lease_end_date && (
                      <div className="text-xs text-muted-foreground">
                        Lease: {new Date(tenant.lease_start_date).toLocaleDateString()} -{" "}
                        {new Date(tenant.lease_end_date).toLocaleDateString()}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Added: {new Date(tenant.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
