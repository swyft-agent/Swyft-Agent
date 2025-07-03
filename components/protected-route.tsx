"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { isUsingMockData } from "@/lib/supabase"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "agent"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // If using mock data in preview, always allow access
    if (isUsingMockData) {
      setIsAuthorized(true)
      return
    }

    // Check if we're on an auth page
    const isAuthPage =
      pathname?.startsWith("/(auth)") ||
      pathname?.includes("/login") ||
      pathname?.includes("/signup") ||
      pathname?.includes("/forgot-password") ||
      pathname?.includes("/reset-password")

    // If we're not loading and there's no user and we're not on an auth page, redirect to login
    if (!loading && !user && !isAuthPage) {
      console.log("Protected route: No user found, redirecting to login")
      router.push("/login")
    } else if (!loading) {
      // Check role requirements
      if (requiredRole && profile?.role !== requiredRole) {
        router.push("/") // Redirect to dashboard if insufficient permissions
        return
      }
      // If we're not loading and there is a user or we're on an auth page, allow access
      setIsAuthorized(true)
    }
  }, [user, profile, loading, router, pathname, requiredRole])

  // Show loading while checking authorization
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show nothing while checking authorization
  if (!isAuthorized) {
    return null
  }

  // Check role requirements after authorization
  if (requiredRole && profile?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

// Also export as default for backward compatibility
export default ProtectedRoute
