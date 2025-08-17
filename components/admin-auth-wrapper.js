"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Shield, AlertCircle } from "lucide-react"

export default function AdminAuthWrapper({ children }) {
  const { user, isAuthenticated, isAdmin, loading, profile } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log('AdminAuthWrapper state:', { 
      loading, 
      isAuthenticated, 
      isAdmin, 
      hasUser: !!user, 
      hasProfile: !!profile,
      profileAdmin: profile?.is_admin
    })

    // Wait for auth to finish loading
    if (loading) {
      console.log('Still loading auth state...')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login')
      router.push("/login?redirect=/admin")
      return
    }

    // Wait a bit more for profile to load if user exists but profile doesn't
    if (isAuthenticated && user && !profile) {
      console.log('User authenticated but profile not loaded yet, waiting...')
      // Give a short timeout to let profile load
      const timeout = setTimeout(() => {
        setIsChecking(false) // Stop checking to prevent infinite loading
      }, 2000) // 2 second timeout
      
      return () => clearTimeout(timeout)
    }

    // Check if user is admin
    if (isAuthenticated && !isAdmin) {
      console.log('User authenticated but not admin, redirecting home')
      router.push("/")
      return
    }

    // User is authenticated and admin
    console.log('User is authenticated admin, showing content')
    setIsChecking(false)
  }, [isAuthenticated, isAdmin, loading, user, profile, router])

  // Show loading while checking authentication
  if (loading || (isChecking && (!user || !profile))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying Access</h2>
            <p className="text-gray-600 text-center">Please wait while we verify your admin credentials...</p>
            {/* Debug info - remove in production */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              Loading: {loading.toString()}, User: {!!user ? 'Yes' : 'No'}, Profile: {!!profile ? 'Yes' : 'No'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if not authenticated (shouldn't happen due to redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-8 h-8 text-red-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 text-center">You need to sign in to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if not admin (shouldn't happen due to redirect)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Shield className="w-8 h-8 text-orange-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 text-center">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated and admin, render the admin content
  return children
}
