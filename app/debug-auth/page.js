"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { signIn as signInSupabase } from "@/lib/supabase"

export default function DebugAuthPage() {
  const { user, profile, loading, isAuthenticated, isAdmin } = useAuth()
  const [loginResult, setLoginResult] = useState(null)

  const testAdminLogin = async () => {
    console.log('Testing admin login...')
    const result = await signInSupabase('admin@carpolish.com', 'password')
    console.log('Login result:', result)
    setLoginResult(result)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Auth State:</h2>
          <p>Loading: {loading.toString()}</p>
          <p>Is Authenticated: {isAuthenticated.toString()}</p>
          <p>Is Admin: {isAdmin.toString()}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
          <p>Profile: {profile ? JSON.stringify(profile, null, 2) : 'null'}</p>
        </div>

        <button 
          onClick={testAdminLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Admin Login
        </button>

        {loginResult && (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-bold">Login Result:</h2>
            <pre>{JSON.stringify(loginResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
