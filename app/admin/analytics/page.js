"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AdminAuthWrapper from "@/components/admin-auth-wrapper"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Home, 
  BarChart3,
  RefreshCw
} from "lucide-react"
import { getOrders, getUsers, getProducts } from "@/lib/supabase"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [revenueData, setRevenueData] = useState([])
  const [productSalesData, setProductSalesData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [monthlyStats, setMonthlyStats] = useState({
    currentMonth: { revenue: 0, orders: 0, growth: 0 },
    previousMonth: { revenue: 0, orders: 0 }
  })

  useEffect(() => {
    loadAnalyticsData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadAnalyticsData(true)
    }, 300000)
    
    return () => clearInterval(interval)
  }, [])

  const loadAnalyticsData = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      // Fetch data
      const [ordersResult, usersResult, productsResult] = await Promise.all([
        getOrders(),
        getUsers(),
        getProducts()
      ])

      const orders = ordersResult.data || []
      const users = usersResult.data || []
      const products = productsResult.data || []

      // Generate monthly revenue data (last 12 months)
      const monthlyData = []
      const now = new Date()
      
      for (let i = 11; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at)
          return orderDate >= monthStart && orderDate <= monthEnd
        })
        
        const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        
        monthlyData.push({
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthRevenue,
          orders: monthOrders.length
        })
      }
      
      setRevenueData(monthlyData)

      // Calculate current vs previous month stats
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      const currentMonthOrders = orders.filter(order => 
        new Date(order.created_at) >= currentMonthStart
      )
      const previousMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= previousMonthStart && orderDate <= previousMonthEnd
      })

      const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      
      const revenueGrowth = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100) 
        : 0

      setMonthlyStats({
        currentMonth: { 
          revenue: currentMonthRevenue, 
          orders: currentMonthOrders.length, 
          growth: revenueGrowth 
        },
        previousMonth: { 
          revenue: previousMonthRevenue, 
          orders: previousMonthOrders.length 
        }
      })

      // Calculate product sales from orders
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

      const productSalesArray = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)

      setProductSalesData(productSalesArray)

      // Generate category data based on product names
      const categoryMap = {
        'Shiner': 0,
        'Coating': 0,
        'Clean': 0,
        'Combo': 0
      }

      productSalesArray.forEach(product => {
        if (product.name.toLowerCase().includes('shiner') || product.name.toLowerCase().includes('shine')) {
          categoryMap.Shiner += product.sales
        } else if (product.name.toLowerCase().includes('coating') || product.name.toLowerCase().includes('coat')) {
          categoryMap.Coating += product.sales
        } else if (product.name.toLowerCase().includes('clean')) {
          categoryMap.Clean += product.sales
        } else if (product.name.toLowerCase().includes('combo') || product.name.toLowerCase().includes('ultimate')) {
          categoryMap.Combo += product.sales
        }
      })

      const categoryArray = Object.entries(categoryMap)
        .filter(([_, value]) => value > 0)
        .map(([name, value], index) => ({
          name,
          value,
          color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
        }))

      setCategoryData(categoryArray)

    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      if (!silentRefresh) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  if (loading) {
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
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Users className="w-4 h-4" />
                Users
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Business insights and performance metrics</p>
              </div>
            </div>

            {/* Loading State */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1,2,3,4].map((i) => (
                <Card key={i} className="bg-white">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-white">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminAuthWrapper>
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
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Users className="w-4 h-4" />
              Users
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Business insights and performance metrics</p>
            </div>
            <Button
              onClick={() => loadAnalyticsData(true)}
              disabled={refreshing}
              variant="outline"
              className="bg-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh'}
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">
                      NPR {monthlyStats.currentMonth.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      {monthlyStats.currentMonth.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                      )}
                      <span className={monthlyStats.currentMonth.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(monthlyStats.currentMonth.growth).toFixed(1)}%
                      </span>
                      {' '}from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Orders</p>
                    <p className="text-2xl font-bold">{monthlyStats.currentMonth.orders}</p>
                    <p className="text-xs text-gray-500">
                      {monthlyStats.previousMonth.orders > 0 
                        ? `${((monthlyStats.currentMonth.orders - monthlyStats.previousMonth.orders) / monthlyStats.previousMonth.orders * 100).toFixed(1)}% from last month`
                        : 'First month data'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Order Value</p>
                    <p className="text-2xl font-bold">
                      NPR {monthlyStats.currentMonth.orders > 0 
                        ? Math.round(monthlyStats.currentMonth.revenue / monthlyStats.currentMonth.orders).toLocaleString()
                        : 0
                      }
                    </p>
                    <p className="text-xs text-gray-500">Per order average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product Categories</p>
                    <p className="text-2xl font-bold">{categoryData.length}</p>
                    <p className="text-xs text-gray-500">Active categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`NPR ${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Orders per Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Orders']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="orders" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {productSalesData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={productSalesData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'revenue') {
                              return [`NPR ${value.toLocaleString()}`, 'Revenue']
                            }
                            return [value, name]
                          }}
                        />
                        <Bar dataKey="revenue" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No product sales data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [value, 'Units Sold']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No category data available
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
