"use client"

import { BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"
import { shouldShowSampleData } from "@/lib/environment"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [showSampleData, setShowSampleData] = useState(false)
  const [data, setData] = useState({
    tenants: [],
    buildings: [],
    expenses: [],
    units: [],
    payments: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setShowSampleData(shouldShowSampleData())
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    if (!user) return

    try {
      const [tenantsRes, buildingsRes, expensesRes, unitsRes, paymentsRes] = await Promise.all([
        supabase.from("tenants").select("*").eq("company_account_id", user.company_account_id),
        supabase.from("buildings").select("*").eq("company_account_id", user.company_account_id),
        supabase.from("expenses").select("*").eq("company_account_id", user.company_account_id),
        supabase.from("units").select("*").eq("company_account_id", user.company_account_id),
        supabase.from("payments").select("*").eq("company_account_id", user.company_account_id),
      ])

      setData({
        tenants: tenantsRes.data || [],
        buildings: buildingsRes.data || [],
        expenses: expensesRes.data || [],
        units: unitsRes.data || [],
        payments: paymentsRes.data || [],
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (type: string) => {
    switch (type) {
      case "tenants":
        return {
          total: data.tenants.length,
          active: data.tenants.filter((t: any) => t.status === "active").length,
          totalRent: data.tenants.reduce((sum: number, t: any) => sum + (t.monthly_rent || 0), 0),
        }
      case "buildings":
        return {
          total: data.buildings.length,
          totalUnits: data.buildings.reduce((sum: number, b: any) => sum + (b.total_units || 0), 0),
        }
      case "expenses":
        return {
          total: data.expenses.length,
          totalAmount: data.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
          pending: data.expenses.filter((e: any) => e.status === "pending").length,
        }
      case "units":
        return {
          total: data.units.length,
          vacant: data.units.filter((u: any) => u.status === "vacant").length,
          occupied: data.units.filter((u: any) => u.status === "occupied").length,
        }
      case "payments":
        return {
          total: data.payments.length,
          totalAmount: data.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          thisMonth: data.payments.filter((p: any) => new Date(p.payment_date).getMonth() === new Date().getMonth())
            .length,
        }
      default:
        return {}
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Loading your data analytics...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <BarChart3 className="h-8 w-8 animate-pulse text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Comprehensive view of your property management data</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants ({data.tenants.length})</TabsTrigger>
          <TabsTrigger value="buildings">Buildings ({data.buildings.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({data.expenses.length})</TabsTrigger>
          <TabsTrigger value="units">Units ({data.units.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({data.payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.tenants.length}</div>
                <p className="text-xs text-muted-foreground">{calculateSummary("tenants").active} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.buildings.length}</div>
                <p className="text-xs text-muted-foreground">{calculateSummary("buildings").totalUnits} units</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KSh {calculateSummary("tenants").totalRent?.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From rent</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KSh {calculateSummary("expenses").totalAmount?.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{calculateSummary("expenses").pending} pending</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Add similar TabsContent for each data type with tables and summaries */}
        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle>Tenants Overview</CardTitle>
              <CardDescription>Manage and view all tenant information</CardDescription>
            </CardHeader>
            <CardContent>
              {data.tenants.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tenants data available</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{calculateSummary("tenants").total}</div>
                      <div className="text-sm text-gray-600">Total Tenants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{calculateSummary("tenants").active}</div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        KSh {calculateSummary("tenants").totalRent?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Rent</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with other tabs... */}
      </Tabs>
    </div>
  )
}
