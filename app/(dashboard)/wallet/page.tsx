"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface Transaction {
  id: string
  transaction_type: "deposit" | "withdrawal" | "ad_spend" | "refund" | "bonus"
  amount: number
  description: string
  status: "completed" | "pending" | "failed" | "cancelled"
  created_at: string
  reference_id?: string
  external_reference?: string
  payment_method?: string
  phone_number?: string
}

interface WalletData {
  balance: number
  pending_balance: number
  total_deposits: number
  total_withdrawals: number
  total_spent_on_ads: number
  currency: string
  status: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function WalletPage() {
  const { user } = useAuth()
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    pending_balance: 0,
    total_deposits: 0,
    total_withdrawals: 0,
    total_spent_on_ads: 0,
    currency: "KES",
    status: "active",
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchWalletData()
      fetchTransactions()
    }
  }, [user?.id])

  const fetchWalletData = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from("wallet")
        .select("*")
        .eq("company_account_id", userData.company_account_id)
        .single()

      if (error && error.code !== "PGRST116") throw error

      if (data) {
        setWalletData({
          balance: data.balance || 0,
          pending_balance: data.pending_balance || 0,
          total_deposits: data.total_deposits || 0,
          total_withdrawals: data.total_withdrawals || 0,
          total_spent_on_ads: data.total_spent_on_ads || 0,
          currency: data.currency || "KES",
          status: data.status || "active",
        })
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_account_id")
        .eq("id", user?.id)
        .single()

      if (userError) throw userError

      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("company_account_id", userData.company_account_id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "refund":
      case "bonus":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case "withdrawal":
      case "ad_spend":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransactionSign = (type: string) => {
    return type === "deposit" || type === "refund" || type === "bonus" ? "+" : "-"
  }

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Deposit
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(5)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your payments and transactions</p>
        </div>
        <Link href="/wallet/deposit">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Deposit via M-Pesa
          </Button>
        </Link>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(walletData.balance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(walletData.pending_balance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletData.total_deposits)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletData.total_withdrawals)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletData.total_spent_on_ads)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-4">Your transaction history will appear here</p>
              <Link href="/wallet/deposit">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Make your first deposit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium">{transaction.description || transaction.transaction_type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                      {transaction.external_reference && (
                        <p className="text-xs text-gray-400">Ref: {transaction.external_reference}</p>
                      )}
                      {transaction.phone_number && (
                        <p className="text-xs text-gray-400">Phone: {transaction.phone_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        getTransactionSign(transaction.transaction_type) === "+" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {getTransactionSign(transaction.transaction_type)}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
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
