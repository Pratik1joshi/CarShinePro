"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@carpolish.com')
  const [password, setPassword] = useState('password')
  const [result, setResult] = useState(null)
  const { signIn, user, profile, isAdmin, loading } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    console.log('Test login: Starting login process...')
    setResult('Logging in...')
    
    try {
      const loginResult = await signIn(email, password)
      console.log('Test login: Result:', loginResult)
      setResult(JSON.stringify(loginResult, null, 2))
      
      if (loginResult.success) {
        console.log('Login successful, waiting 2 seconds then redirecting...')
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      }
    } catch (error) {
      console.error('Test login error:', error)
      setResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Test Admin Login</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <Button onClick={handleLogin} disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login as Admin'}
        </Button>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <div><strong>Loading:</strong> {loading.toString()}</div>
        <div><strong>User:</strong> {user ? `${user.email} (ID: ${user.id})` : 'None'}</div>
        <div><strong>Profile:</strong> {profile ? JSON.stringify(profile) : 'None'}</div>
        <div><strong>Is Admin:</strong> {isAdmin.toString()}</div>
      </div>

      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <strong>Result:</strong>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}
