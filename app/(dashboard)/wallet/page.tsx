"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  AlertCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface WalletData {
  id: string
  balance: number
  pending_balance: number
  total_deposits: number
  total_withdrawals: number
  total_spent_on_ads: number
  currency: string
  status: string
  created_at: string
  updated_at: string
}

interface WalletTransaction {
  id: string
  amount: number
  transaction_type: "deposit" | "withdrawal" | "ad_spend" | "refund" | "bonus"
  status: string
  description: string
  reference_id: string
  payment_method: string
  ad_id: string
  created_at: string
}

export default function WalletPage() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.id) {
      fetchWalletData()
    }
  }, [user?.id])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      setError("")

      // Get user's company info first
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) {
        console.error("User fetch error:", userError)
        throw userError
      }

      // Fetch wallet data using correct column names
      let walletQuery = supabase
        .from("wallet")
        .select(
          "id, balance, pending_balance, total_deposits, total_withdrawals, total_spent_on_ads, currency, status, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(1)

      // Filter by company_account_id or user_id
      if (userData.company_account_id && userData.company_account_id !== "null") {
        walletQuery = walletQuery.eq("company_account_id", userData.company_account_id)
      } else {
        walletQuery = walletQuery.eq("user_id", user?.id)
      }

      const { data: walletData, error: walletError } = await walletQuery

      if (walletError) {
        console.error("Wallet fetch error:", walletError)
        throw walletError
      }

      // If no wallet exists, create one
      if (!walletData || walletData.length === 0) {
        const newWallet = {
          user_id: user?.id,
          company_account_id: userData.company_account_id || null,
          balance: 0,
          pending_balance: 0,
          total_deposits: 0,
          total_withdrawals: 0,
          total_spent_on_ads: 0,
          currency: "KES",
          status: "active",
        }

        const { data: createdWallet, error: createError } = await supabase
          .from("wallet")
          .insert([newWallet])
          .select()
          .single()

        if (createError) {
          console.error("Wallet creation error:", createError)
          throw createError
        }

        setWallet(createdWallet)
      } else {
        setWallet(walletData[0])
      }

      // Fetch transactions from wallet_transactions table
      // The wallet_transactions table has wallet_id and company_account_id, but NO user_id
      let transactionsQuery = supabase
        .from("wallet_transactions")
        .select("id, amount, transaction_type, status, description, reference_id, payment_method, ad_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50)

      // Filter transactions properly based on table schema
      if (userData.company_account_id && userData.company_account_id !== "null") {
        // For company users, filter by company_account_id
        transactionsQuery = transactionsQuery.eq("company_account_id", userData.company_account_id)
      } else {
        // For individual users, filter by wallet_id (not user_id!)
        const currentWallet = walletData && walletData.length > 0 ? walletData[0] : wallet
        if (currentWallet?.id) {
          transactionsQuery = transactionsQuery.eq("wallet_id", currentWallet.id)
        } else {
          // No wallet found, no transactions to fetch
          console.log("No wallet found for user, skipping transaction fetch")
          setTransactions([])
          return
        }
      }

      const { data: transactionsData, error: transactionsError } = await transactionsQuery

      if (transactionsError) {
        console.error("Transactions fetch error:", transactionsError)
        // Don't throw here, just log the error
        setTransactions([])
      } else {
        setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
      }
    } catch (error: any) {
      console.error("Error fetching wallet data:", error)
      setError(error.message || "Failed to load wallet data")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const getTransactionIcon = (type: string) => {
    return type === "deposit" || type === "refund" || type === "bonus" ? (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    )
  }

  const getTransactionColor = (type: string) => {
    return type === "deposit" || type === "refund" || type === "bonus" ? "text-green-600" : "text-red-600"
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Money Added"
      case "withdrawal":
        return "Money Withdrawn"
      case "ad_spend":
        return "Ad Spending"
      case "refund":
        return "Refund"
      case "bonus":
        return "Bonus"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  if (error) {
    return (
      <div className="w-full space-y-4 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your account balance and transactions</p>
        </div>
        <Button asChild>
          <Link href="/wallet/deposit">
            <Plus className="mr-2 h-4 w-4" />
            Add Money
          </Link>
        </Button>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Status:{" "}
              <Badge
                className={wallet?.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {wallet?.status || "Unknown"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet?.total_deposits || 0)}</div>
            <p className="text-xs text-muted-foreground">All time deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet?.total_spent_on_ads || 0)}</div>
            <p className="text-xs text-muted-foreground">Total spent on ads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet?.pending_balance || 0)}</div>
            <p className="text-xs text-muted-foreground">Processing transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="deposit">Money In</TabsTrigger>
          <TabsTrigger value="withdrawal">Money Out</TabsTrigger>
          <TabsTrigger value="ad_spend">Ad Spending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-600 mb-4">Your transaction history will appear here</p>
                  <Button asChild>
                    <Link href="/wallet/deposit">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Money to Get Started
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium">
                            {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()} •{" "}
                            <Badge
                              className={
                                transaction.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                          {transaction.transaction_type === "deposit" ||
                          transaction.transaction_type === "refund" ||
                          transaction.transaction_type === "bonus"
                            ? "+"
                            : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.reference_id && (
                          <p className="text-xs text-gray-500">Ref: {transaction.reference_id}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Money In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions
                  .filter(
                    (t) =>
                      t.transaction_type === "deposit" ||
                      t.transaction_type === "refund" ||
                      t.transaction_type === "bonus",
                  )
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">
                            {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600">+{formatCurrency(transaction.amount)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Money Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions
                  .filter((t) => t.transaction_type === "withdrawal")
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">
                            {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600">-{formatCurrency(transaction.amount)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ad_spend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions
                  .filter((t) => t.transaction_type === "ad_spend")
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">
                            {transaction.description || getTransactionTypeLabel(transaction.transaction_type)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                            {transaction.ad_id && ` • Ad ID: ${transaction.ad_id}`}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-red-600">-{formatCurrency(transaction.amount)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
