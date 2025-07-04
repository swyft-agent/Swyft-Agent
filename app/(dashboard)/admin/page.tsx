"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building, DollarSign, Activity, Shield, TrendingUp } from "lucide-react"
import { AddAgentModal } from "@/components/add-agent-modal"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { getCachedData, CACHE_KEYS } from "@/lib/cache"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts"

const AdminPage = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAddAgentModal, setShowAddAgentModal] = useState(false)
  const [agentsList, setAgentsList] = useState([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [financials, setFinancials] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Mock user role - in a real app, this would come from authentication
  const currentUserRole = user?.role || "admin"

  useEffect(() => {
    if (currentUserRole !== "admin") {
      setIsAuthorized(false)
    } else {
      setIsAuthorized(true)
      loadAdminData()
    }
  }, [currentUserRole, user])

  const loadAdminData = async () => {
    if (!user?.company_account_id) return

    try {
      setLoading(true)

      // Fetch analytics data with proper cache key
      const analyticsData = await getCachedData(
        CACHE_KEYS.ANALYTICS(user.company_account_id),
        async () => {
          // Fetch real analytics data from database
          const [tenantsResult, buildingsResult, unitsResult] = await Promise.all([
            supabase.from("tenants").select("*").eq("company_account_id", user.company_account_id),
            supabase.from("buildings").select("*").eq("company_account_id", user.company_account_id),
            supabase.from("vacant_units").select("*").eq("company_account_id", user.company_account_id),
          ])

          const tenants = tenantsResult.data || []
          const buildings = buildingsResult.data || []
          const units = unitsResult.data || []

          // Calculate analytics
          const totalTenants = tenants.length
          const totalBuildings = buildings.length
          const totalUnits = units.length
          const occupiedUnits = tenants.filter((t) => t.status === "active").length
          const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

          // Tenant status distribution
          const tenantStatusData = [
            { name: "Active", value: tenants.filter((t) => t.status === "active").length, color: "#10b981" },
            { name: "Moving Out", value: tenants.filter((t) => t.status === "moving-out").length, color: "#f59e0b" },
            { name: "Moved Out", value: tenants.filter((t) => t.status === "moved-out").length, color: "#ef4444" },
          ]

          // Rent status distribution
          const rentStatusData = [
            { name: "Current", value: tenants.filter((t) => t.rent_status === "current").length, color: "#10b981" },
            { name: "Late", value: tenants.filter((t) => t.rent_status === "late").length, color: "#ef4444" },
          ]

          // Monthly trends (mock data for now)
          const monthlyTrends = [
            { month: "Jan", tenants: 45, revenue: 450000, occupancy: 85 },
            { month: "Feb", tenants: 52, revenue: 520000, occupancy: 88 },
            { month: "Mar", tenants: 48, revenue: 480000, occupancy: 82 },
            { month: "Apr", tenants: 61, revenue: 610000, occupancy: 92 },
            { month: "May", tenants: 55, revenue: 550000, occupancy: 89 },
            {
              month: "Jun",
              tenants: totalTenants,
              revenue: totalTenants * 10000,
              occupancy: Math.round(occupancyRate),
            },
          ]

          return {
            totalTenants,
            totalBuildings,
            totalUnits,
            occupiedUnits,
            occupancyRate,
            tenantStatusData,
            rentStatusData,
            monthlyTrends,
          }
        },
        5 * 60 * 1000, // 5 minutes cache
      )

      // Fetch financial data with proper cache key
      const financialData = await getCachedData(
        CACHE_KEYS.FINANCIALS(user.company_account_id),
        async () => {
          // Try to fetch real expenses and payments data
          const [expensesResult, paymentsResult] = await Promise.all([
            supabase.from("expenses").select("*").eq("company_account_id", user.company_account_id),
            supabase.from("payments").select("*").eq("company_account_id", user.company_account_id),
          ])

          const expenses = expensesResult.data || []
          const payments = paymentsResult.data || []

          // Calculate real financial data if available, otherwise use mock data
          let monthlyRevenue, expenseBreakdown, totalRevenue, totalExpenses, totalProfit

          if (payments.length > 0 || expenses.length > 0) {
            // Use real data
            const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
            const totalExpensesAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)

            monthlyRevenue = [
              {
                month: "Current",
                revenue: totalPayments,
                expenses: totalExpensesAmount,
                profit: totalPayments - totalExpensesAmount,
              },
            ]

            expenseBreakdown = expenses.reduce((acc: any[], expense) => {
              const existing = acc.find((item) => item.category === expense.category)
              if (existing) {
                existing.amount += expense.amount || 0
              } else {
                acc.push({
                  category: expense.category || "Other",
                  amount: expense.amount || 0,
                  color: "#3b82f6",
                })
              }
              return acc
            }, [])

            totalRevenue = totalPayments
            totalExpenses = totalExpensesAmount
            totalProfit = totalRevenue - totalExpenses
          } else {
            // Use mock data
            monthlyRevenue = [
              { month: "Jan", revenue: 450000, expenses: 120000, profit: 330000 },
              { month: "Feb", revenue: 520000, expenses: 135000, profit: 385000 },
              { month: "Mar", revenue: 480000, expenses: 125000, profit: 355000 },
              { month: "Apr", revenue: 610000, expenses: 150000, profit: 460000 },
              { month: "May", revenue: 550000, expenses: 140000, profit: 410000 },
              { month: "Jun", revenue: 670000, expenses: 160000, profit: 510000 },
            ]

            expenseBreakdown = [
              { category: "Maintenance", amount: 45000, color: "#3b82f6" },
              { category: "Utilities", amount: 35000, color: "#10b981" },
              { category: "Insurance", amount: 25000, color: "#f59e0b" },
              { category: "Marketing", amount: 15000, color: "#ef4444" },
              { category: "Other", amount: 40000, color: "#8b5cf6" },
            ]

            totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0)
            totalExpenses = monthlyRevenue.reduce((sum, month) => sum + month.expenses, 0)
            totalProfit = totalRevenue - totalExpenses
          }

          return {
            monthlyRevenue,
            expenseBreakdown,
            totalRevenue,
            totalExpenses,
            totalProfit,
          }
        },
        5 * 60 * 1000, // 5 minutes cache
      )

      setAnalytics(analyticsData)
      setFinancials(financialData)
    } catch (error) {
      console.error("Error loading admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agentsList.filter((agent: any) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || agent.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleToggleStatus = (agentId: number, currentStatus: string) => {
    console.log(`Toggling status for agent ${agentId} from ${currentStatus}`)
  }

  const handleAddAgent = (newAgent: any) => {
    setAgentsList((prev) => [...prev, newAgent])
  }

  if (!isAuthorized) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-sm">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel. Please contact your administrator.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Company analytics and system management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddAgentModal(true)}>Add Agent</Button>
          <Badge variant="outline" className="bg-primary/10">
            <Shield className="mr-1 h-3 w-3" />
            Admin Access
          </Badge>
        </div>
      </div>

      {/* System Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTenants}</div>
              <p className="text-xs text-muted-foreground">{analytics.occupiedUnits} active</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBuildings}</div>
              <p className="text-xs text-muted-foreground">{analytics.totalUnits} total units</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.occupancyRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.occupiedUnits}/{analytics.totalUnits} occupied
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh {financials?.monthlyRevenue[financials.monthlyRevenue.length - 1]?.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {analytics && financials && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tenant Status Distribution */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Tenant Status Distribution</CardTitle>
              <CardDescription>Current status of all tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.tenantStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.tenantStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Revenue Trend */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue and profit over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financials.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`KSh ${value.toLocaleString()}`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Monthly expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financials.expenseBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`KSh ${value.toLocaleString()}`, ""]} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy Trend */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Occupancy Trend</CardTitle>
              <CardDescription>Occupancy rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}%`, "Occupancy"]} />
                  <Line type="monotone" dataKey="occupancy" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Summary */}
      {financials && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">KSh {financials.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">KSh {financials.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">KSh {financials.totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </CardContent>
          </Card>
        </div>
      )}

      <AddAgentModal open={showAddAgentModal} onOpenChange={setShowAddAgentModal} onAddAgent={handleAddAgent} />
    </div>
  )
}

export default AdminPage
