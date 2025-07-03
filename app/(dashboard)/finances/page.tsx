"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, TrendingUp, TrendingDown, Download, Search, Calendar, Upload, CreditCard } from "lucide-react"
import EmptyState from "@/components/empty-state"
import { shouldShowSampleData } from "@/lib/environment"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ExcelImport } from "@/components/excel-import"

export default function FinancesPage() {
  const [showSampleData, setShowSampleData] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showImport, setShowImport] = useState(false)
  const [financialData, setFinancialData] = useState<any>({
    revenueBreakdown: [],
    expenseBreakdown: [],
    cashFlow: [],
    transactions: [],
  })

  useEffect(() => {
    // Only show sample data in preview environments
    setShowSampleData(shouldShowSampleData())

    // In a real app, we would fetch actual data here
    if (!shouldShowSampleData()) {
      // This would be a real API call in production
      // fetchFinancialData().then(data => setFinancialData(data))
    }
  }, [])

  // Sample data - only used in preview
  const sampleRevenueBreakdownData = [
    { month: "Jan", rent: 8500000, deposits: 1200000 },
    { month: "Feb", rent: 8750000, deposits: 980000 },
    { month: "Mar", rent: 9100000, deposits: 1450000 },
    { month: "Apr", rent: 8900000, deposits: 1100000 },
    { month: "May", rent: 9300000, deposits: 1350000 },
    { month: "Jun", rent: 9500000, deposits: 1200000 },
  ]

  const sampleExpenseBreakdownData = [
    { category: "Maintenance", amount: 2100000, percentage: 35, color: "#EF4444" },
    { category: "Utilities", amount: 1800000, percentage: 30, color: "#F59E0B" },
    { category: "Insurance", amount: 900000, percentage: 15, color: "#3B82F6" },
    { category: "Property Tax", amount: 600000, percentage: 10, color: "#8B5CF6" },
    { category: "Management", amount: 600000, percentage: 10, color: "#10B981" },
  ]

  const sampleCashFlowData = [
    { month: "Jan", inflow: 10470000, outflow: 6200000, netFlow: 4270000 },
    { month: "Feb", inflow: 10530000, outflow: 6100000, netFlow: 4430000 },
    { month: "Mar", inflow: 11440000, outflow: 6800000, netFlow: 4640000 },
    { month: "Apr", inflow: 10860000, outflow: 6400000, netFlow: 4460000 },
    { month: "May", inflow: 11620000, outflow: 6900000, netFlow: 4720000 },
    { month: "Jun", inflow: 11740000, outflow: 7100000, netFlow: 4640000 },
  ]

  // Sample transaction data
  const sampleTransactions = [
    {
      id: 1,
      date: "2025-06-04",
      description: "Rent Collection - Skyline Apartments",
      amount: 2850000,
      type: "revenue",
      status: "completed",
      category: "rent",
    },
    {
      id: 2,
      date: "2025-06-03",
      description: "Maintenance - Downtown Lofts",
      amount: -180000,
      type: "expense",
      status: "completed",
      category: "maintenance",
    },
    {
      id: 3,
      date: "2025-06-02",
      description: "Security Deposit - Parkview Heights",
      amount: 450000,
      type: "revenue",
      status: "completed",
      category: "deposit",
    },
    {
      id: 4,
      date: "2025-06-01",
      description: "Utility Bills - Multiple Properties",
      amount: -320000,
      type: "expense",
      status: "pending",
      category: "utilities",
    },
    {
      id: 5,
      date: "2025-05-31",
      description: "Late Fees - Various Tenants",
      amount: 85000,
      type: "revenue",
      status: "completed",
      category: "fees",
    },
  ]

  // Use sample data in preview, real data in production
  const revenueBreakdownData = showSampleData ? sampleRevenueBreakdownData : financialData.revenueBreakdown
  const expenseBreakdownData = showSampleData ? sampleExpenseBreakdownData : financialData.expenseBreakdown
  const cashFlowData = showSampleData ? sampleCashFlowData : financialData.cashFlow
  const transactions = showSampleData ? sampleTransactions : financialData.transactions || []

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const totalRevenue = transactions
    .filter((t) => t.type === "revenue" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(
    transactions.filter((t) => t.type === "expense" && t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
  )

  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyShort = (amount: number): string => {
    if (amount >= 1000000) {
      return `KSh ${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `KSh ${(amount / 1000).toFixed(1)}K`
    }
    return formatCurrency(amount)
  }

  const handleImportSuccess = (importedData: any[]) => {
    console.log("Imported financial data:", importedData)
    setShowImport(false)

    // In a real app, we would process and save this data
    // processAndSaveFinancialData(importedData).then(() => {
    //   fetchFinancialData().then(data => setFinancialData(data))
    // })
  }

  const financialColumns = [
    { key: "date", label: "Date", required: true, type: "date" },
    { key: "description", label: "Description", required: true },
    { key: "amount", label: "Amount", required: true, type: "number" },
    { key: "type", label: "Type", required: true },
    { key: "category", label: "Category", required: false },
    { key: "status", label: "Status", required: false },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "processed":
        return <Badge variant="default">Processed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "revenue":
        return <Badge className="bg-blue-500">Revenue</Badge>
      case "expense":
        return <Badge className="bg-red-500">Expense</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Check if we have any data to display
  const hasData =
    showSampleData ||
    financialData.revenueBreakdown?.length > 0 ||
    financialData.expenseBreakdown?.length > 0 ||
    financialData.cashFlow?.length > 0 ||
    financialData.transactions?.length > 0

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Analytics</h1>
          <p className="text-muted-foreground">Comprehensive financial performance and detailed analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import Data
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {!hasData ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Finances</h2>
            <p className="text-gray-600">Track your rental income and expenses.</p>
          </div>

          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Financial Data</h3>
            <p className="text-gray-500">Start by adding rental income and expenses.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Revenue",
                value: formatCurrencyShort(totalRevenue),
                change: "+12.5%",
                icon: DollarSign,
                trend: "up",
              },
              {
                title: "Total Expenses",
                value: formatCurrencyShort(totalExpenses),
                change: "+8.3%",
                icon: TrendingDown,
                trend: "up",
              },
              {
                title: "Net Profit",
                value: formatCurrencyShort(netProfit),
                change: "+15.2%",
                icon: TrendingUp,
                trend: "up",
              },
              {
                title: "Profit Margin",
                value: `${profitMargin.toFixed(1)}%`,
                change: "+2.1%",
                icon: Calendar,
                trend: "up",
              },
            ].map((metric, index) => (
              <Card key={index} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div
                    className={`flex items-center text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
                  >
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {metric.change} from last month
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue & Expense Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Revenue Breakdown Analysis
                </CardTitle>
                <CardDescription>Monthly revenue streams and sources</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueBreakdownData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueBreakdownData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="rent"
                          stackId="1"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.8}
                        />
                        <Area
                          type="monotone"
                          dataKey="deposits"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.8}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    icon={<TrendingUp className="h-8 w-8" />}
                    title="No Revenue Data"
                    description="Record revenue transactions to see your revenue breakdown."
                    actionLabel="Add Transactions"
                    actionOnClick={() => setShowImport(true)}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                  Expense Distribution
                </CardTitle>
                <CardDescription>Breakdown of operational expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseBreakdownData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdownData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="amount"
                          label={({ category, percentage }) => `${category} ${percentage}%`}
                        >
                          {expenseBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    icon={<TrendingDown className="h-8 w-8" />}
                    title="No Expense Data"
                    description="Record expense transactions to see your expense distribution."
                    actionLabel="Add Transactions"
                    actionOnClick={() => setShowImport(true)}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Analytics */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Cash Flow Analysis
              </CardTitle>
              <CardDescription>Monthly cash inflows, outflows, and net cash flow</CardDescription>
            </CardHeader>
            <CardContent>
              {cashFlowData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="inflow" fill="#10B981" name="Cash Inflow" />
                      <Bar dataKey="outflow" fill="#EF4444" name="Cash Outflow" />
                      <Bar dataKey="netFlow" fill="#3B82F6" name="Net Cash Flow" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  icon={<Calendar className="h-8 w-8" />}
                  title="No Cash Flow Data"
                  description="Record financial transactions to see your cash flow analysis."
                  actionLabel="Add Transactions"
                  actionOnClick={() => setShowImport(true)}
                />
              )}
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <div className="flex-1 overflow-hidden">
            <Card className="border-none shadow-sm h-full">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Financial Transaction History</CardTitle>
                    <CardDescription>Detailed record of all financial transactions</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="overflow-auto h-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <EmptyState
                              icon={<CreditCard className="h-8 w-8" />}
                              title="No Transactions Found"
                              description={
                                transactions.length === 0
                                  ? "Start by adding financial transactions."
                                  : "No transactions match your current filters."
                              }
                              actionLabel={transactions.length === 0 ? "Import Transactions" : "Clear Filters"}
                              actionOnClick={
                                transactions.length === 0
                                  ? () => setShowImport(true)
                                  : () => {
                                      setSearchTerm("")
                                      setTypeFilter("all")
                                      setStatusFilter("all")
                                    }
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{transaction.description}</TableCell>
                            <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                            <TableCell className={transaction.amount < 0 ? "text-red-600" : "text-green-600"}>
                              {formatCurrency(Math.abs(transaction.amount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{transaction.category}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <ExcelImport
        open={showImport}
        onOpenChange={setShowImport}
        onImportSuccess={handleImportSuccess}
        tableName="financial_data"
        columns={financialColumns}
        title="Import Financial Data"
        description="Upload an Excel file with financial transaction data"
      />
    </div>
  )
}
