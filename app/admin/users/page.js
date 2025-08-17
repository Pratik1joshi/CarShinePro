"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users,
  UserCheck,
  UserX,
  Crown,
  Search,
  Filter,
  Calendar,
  Home,
  BarChart3,
  Package,
  ShoppingCart,
  Eye,
  Edit,
  Ban,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getUsers } from "@/lib/supabase"
import AdminAuthWrapper from "@/components/admin-auth-wrapper"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const { user } = useAuth()

  useEffect(() => {
    loadUsers()
    
    // Auto-refresh users every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadUsers(true) // Pass true for silent refresh
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadUsers = async (silentRefresh = false) => {
    try {
      // Only show loading spinner on initial load, not on auto-refresh
      if (!silentRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      console.log('Admin: Loading all users...', silentRefresh ? '(silent refresh)' : '(initial load)')
      
      const { data, error } = await getUsers()
      
      if (error) {
        console.error('Admin: Error loading users:', error)
        if (!silentRefresh) {
          setUsers([]) // Only clear users on initial load errors
        }
      } else {
        console.log('Admin: Users loaded:', data?.length || 0)
        setUsers(data || [])
      }
    } catch (error) {
      console.warn('Admin: General error loading users:', error)
      if (!silentRefresh) {
        setUsers([]) // Only clear users on initial load errors
      }
    } finally {
      if (!silentRefresh) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleColor = (role) => {
    return role ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

  const getStatusBadge = (user) => {
    // Simple logic - user is active if they have a recent created_at or other activity
    const isActive = user.created_at && new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Active if created within 30 days
    return isActive ? "active" : "inactive"
  }

  const getStatusColor = (status) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.id?.toString().includes(searchTerm) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || 
                       (roleFilter === "admin" && user.is_admin) ||
                       (roleFilter === "customer" && !user.is_admin)
    const status = getStatusBadge(user)
    const matchesStatus = statusFilter === "all" || status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalUsers = users.length
  const activeUsers = users.filter(user => getStatusBadge(user) === "active").length
  const adminUsers = users.filter(user => user.is_admin).length
  const customerUsers = users.filter(user => !user.is_admin).length

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access the admin panel.</p>
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">CP</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Package className="w-4 h-4" />
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Orders
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg"
          >
            <Users className="w-4 h-4" />
            Users
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Users
              {refreshing && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              )}
            </h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Admin Users</p>
                    <p className="text-2xl font-bold">{adminUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <UserX className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customers</p>
                    <p className="text-2xl font-bold">{customerUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users by ID, name, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadUsers()}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <UserCheck className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">
                    {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No users have been registered yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {user.full_name || "Unknown User"}
                              </h3>
                              <Badge className={getRoleColor(user.is_admin)}>
                                {user.is_admin ? "Admin" : "Customer"}
                              </Badge>
                              <Badge className={getStatusColor(getStatusBadge(user))}>
                                {getStatusBadge(user)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <div className="mb-1">
                                  <strong>Email:</strong> {user.email}
                                </div>
                                <div>
                                  <strong>User ID:</strong> {user.id}
                                </div>
                              </div>
                              <div>
                                <div className="mb-1">
                                  <strong>Joined:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                                </div>
                                <div>
                                  <strong>Last Updated:</strong> {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "Never"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!user.is_admin && (
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AdminAuthWrapper>
  )
}
