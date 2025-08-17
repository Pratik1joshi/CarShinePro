"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Package, ShoppingCart, DollarSign, Eye, ArrowUpRight, Home, BarChart3, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import AdminAuthWrapper from "@/components/admin-auth-wrapper"
import { getOrders, getUsers, getProducts } from "@/lib/supabase"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    usersChange: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadDashboardData(true)
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      // Fetch all data concurrently
      const [ordersResult, usersResult, productsResult] = await Promise.all([
        getOrders(),
        getUsers(), 
        getProducts()
      ])

      const orders = ordersResult.data || []
      const users = usersResult.data || []
      const products = productsResult.data || []

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const totalOrders = orders.length
      const totalProducts = products.length
      const totalUsers = users.length

      // Calculate recent changes (last 7 days vs previous 7 days)
      const now = new Date()
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

      const recentOrders = orders.filter(order => new Date(order.created_at) >= last7Days)
      const previousOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= last14Days && orderDate < last7Days
      })

      const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

      const revenueChange = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue * 100) : 0
      const ordersChange = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length * 100) : 0

      // Recent users (last 7 days vs previous 7 days)
      const recentUsers = users.filter(user => new Date(user.created_at) >= last7Days)
      const previousUsers = users.filter(user => {
        const userDate = new Date(user.created_at)
        return userDate >= last14Days && userDate < last7Days
      })
      const usersChange = previousUsers.length > 0 ? ((recentUsers.length - previousUsers.length) / previousUsers.length * 100) : 0

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        revenueChange,
        ordersChange,
        productsChange: 0, // Products don't change frequently
        usersChange,
      })

      // Set recent orders (last 5)
      setRecentOrders(
        orders
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
          .map(order => ({
            id: order.id,
            customer: order.customer_name || 'Unknown Customer',
            amount: order.total_amount || 0,
            status: order.status,
            date: new Date(order.created_at).toLocaleDateString()
          }))
      )

      // Calculate top products from order items
      const productSales = {}
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productName = item.product_name || 'Unknown Product'
            if (!productSales[productName]) {
              productSales[productName] = { sales: 0, revenue: 0 }
            }
            productSales[productName].sales += item.quantity || 0
            productSales[productName].revenue += item.price || 0
          })
        }
      })

      const topProductsArray = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4)

      setTopProducts(topProductsArray)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      if (!silentRefresh) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'  
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg">
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
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Dashboard
                {refreshing && (
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {stats.revenueChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={stats.revenueChange >= 0 ? "text-green-500" : "text-red-500"}>
                        {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
                      </span>
                      <span className="ml-1">from last week</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stats.totalOrders}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{stats.ordersChange}%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stats.totalProducts}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-gray-500">No change</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stats.totalUsers}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{stats.usersChange}%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">Order #{order.id.slice(0, 8)}...</div>
                          <div className="text-xs text-gray-600">{order.customer}</div>
                          <div className="text-xs text-gray-500">{order.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{formatCurrency(order.amount)}</div>
                          <Badge className={getStatusColor(order.status)} size="sm">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent orders found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Top Products</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/products">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-gray-600">{product.sales} sales</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">NPR {product.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </AdminAuthWrapper>
  )
}
