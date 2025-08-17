"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  ShoppingCart,
  Package,
  Eye,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Home,
  BarChart3,
  User,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getOrders, updateOrderStatus } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import AdminAuthWrapper from "@/components/admin-auth-wrapper"

// Create supabase client for direct queries
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  
  const { user } = useAuth()

  useEffect(() => {
    loadOrders()
    
    // Auto-refresh orders every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadOrders(true) // Pass true for silent refresh
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async (silentRefresh = false) => {
    try {
      // Only show loading spinner on initial load, not on auto-refresh
      if (!silentRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      console.log('Admin: Loading all orders...', silentRefresh ? '(silent refresh)' : '(initial load)')
      console.log('Admin: Current user:', user)
      
      // Method 1: Try using our getOrders function
      console.log('Admin: Trying getOrders() function...')
      const { data, error } = await getOrders()
      
      if (error) {
        console.warn('Admin: getOrders() failed:', error)
      } else {
        console.log('Admin: getOrders() succeeded:', data)
        console.log('Admin: Number of orders:', data?.length || 0)
      }
      
      // Method 2: Try direct query as fallback
      console.log('Admin: Trying direct Supabase query...')
      try {
        const { data: directData, error: directError } = await supabase
          .from("orders")
          .select(`
            *,
            order_items(*)
          `)
          .order("created_at", { ascending: false })
        
        console.log('Admin: Direct query result:', { directData, directError })
        
        if (directError) {
          console.warn('Admin: Direct query failed:', directError)
        } else {
          console.log('Admin: Direct query succeeded with', directData?.length || 0, 'orders')
        }
        
        // Method 3: Try super direct query without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
        
        console.log('Admin: Simple query result:', { simpleData, simpleError })
        
        // Use whichever method worked
        let finalData = data
        if (!finalData || finalData.length === 0) {
          if (directData && directData.length > 0) {
            console.log('Admin: Using direct query data')
            finalData = directData.map(order => ({
              ...order,
              customer_name: order.customer_name || 'Customer',
              customer_email: order.customer_email || 'customer@email.com',
              items: order.order_items || []
            }))
          } else if (simpleData && simpleData.length > 0) {
            console.log('Admin: Using simple query data')
            finalData = simpleData.map(order => ({
              ...order,
              customer_name: order.customer_name || 'Customer',
              customer_email: order.customer_email || 'customer@email.com',
              items: []
            }))
          }
        }
        
        setOrders(finalData || [])
        
      } catch (directQueryError) {
        console.error('Admin: Direct query error:', directQueryError)
        setOrders(data || [])
      }
    } catch (error) {
      console.warn('Admin: General error loading orders:', error)
      if (!silentRefresh) {
        setOrders([]) // Only clear orders on initial load errors
      }
    } finally {
      if (!silentRefresh) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const { error } = await updateOrderStatus(orderId, newStatus)
      if (error) throw error
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsOrderModalOpen(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDeliveryAddress = (address) => {
    if (!address) return null
    
    if (typeof address === 'string') {
      return address
    }
    
    // Handle Nepali address structure
    if (address.tole || address.ward || address.district) {
      const parts = []
      
      // Build address in proper Nepal format
      if (address.tole) parts.push(address.tole)
      if (address.ward) parts.push(`Ward ${address.ward}`)
      if (address.municipality && address.district) {
        parts.push(`${address.municipality}, ${address.district}`)
      } else if (address.district) {
        parts.push(address.district)
      }
      if (address.province) parts.push(address.province)
      
      return {
        formatted: parts.join(', '),
        tole: address.tole,
        ward: address.ward,
        municipality: address.municipality,
        district: address.district,
        province: address.province,
        landmark: address.landmark,
        instructions: address.instructions
      }
    }
    
    // Handle other structured address formats
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city && address.state) parts.push(`${address.city}, ${address.state}`)
    if (address.postal_code) parts.push(address.postal_code)
    if (address.country) parts.push(address.country)
    
    return parts.join(', ') || JSON.stringify(address)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.delivery_address && 
                          (typeof order.delivery_address === 'string' 
                            ? order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())
                            : JSON.stringify(order.delivery_address).toLowerCase().includes(searchTerm.toLowerCase())
                          ))
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    let matchesDate = true
    if (dateFilter !== "all") {
      const orderDate = new Date(order.created_at)
      const today = new Date()
      
      switch (dateFilter) {
        case "today":
          matchesDate = orderDate.toDateString() === today.toDateString()
          break
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= monthAgo
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

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
            className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg"
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Orders
              {refreshing && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              )}
            </h1>
            <p className="text-gray-600">Manage customer orders and track shipments</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipped</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => o.status === 'shipped').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      NPR {orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                    </p>
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
                      placeholder="Search orders by ID, customer name, email, or address..."
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
                    onClick={() => loadOrders()}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="bg-white hover:bg-gray-100">All Status</SelectItem>
                      <SelectItem value="pending" className="bg-white hover:bg-gray-100">Pending</SelectItem>
                      <SelectItem value="confirmed" className="bg-white hover:bg-gray-100">Confirmed</SelectItem>
                      <SelectItem value="shipped" className="bg-white hover:bg-gray-100">Shipped</SelectItem>
                      <SelectItem value="delivered" className="bg-white hover:bg-gray-100">Delivered</SelectItem>
                      <SelectItem value="cancelled" className="bg-white hover:bg-gray-100">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-40 bg-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="bg-white hover:bg-gray-100">All Time</SelectItem>
                      <SelectItem value="today" className="bg-white hover:bg-gray-100">Today</SelectItem>
                      <SelectItem value="week" className="bg-white hover:bg-gray-100">This Week</SelectItem>
                      <SelectItem value="month" className="bg-white hover:bg-gray-100">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Orders ({filteredOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No orders have been placed yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 hover:bg-gray-50">
                      {/* Header Row - Order ID, Status, Price, Actions */}
                      <div className="flex items-center mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-xl font-bold text-green-600">
                            NPR {order.total_amount}
                          </div>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => handleStatusUpdate(order.id, value)}
                          >
                            <SelectTrigger className="w-32 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                              <SelectItem value="pending" className="bg-white hover:bg-gray-100">Pending</SelectItem>
                              <SelectItem value="confirmed" className="bg-white hover:bg-gray-100">Confirmed</SelectItem>
                              <SelectItem value="shipped" className="bg-white hover:bg-gray-100">Shipped</SelectItem>
                              <SelectItem value="delivered" className="bg-white hover:bg-gray-100">Delivered</SelectItem>
                              <SelectItem value="cancelled" className="bg-white hover:bg-gray-100">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Side - Customer & Order Details */}
                        <div className="space-y-4">
                          {/* Customer Information */}
                          <div>
                            <div className="text-base font-medium text-gray-900">{order.customer_name}</div>
                            <div className="text-sm text-gray-600">{order.customer_email}</div>
                            <div className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</div>
                          </div>
                          
                          {/* Order Items */}
                          <div>
                            <div className="font-medium text-gray-900 mb-2">Order Items:</div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {order.items?.map((item, index) => (
                                <div key={index}>
                                  • {item.quantity}x {item.product_name} - NPR {item.price}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Side - Delivery Address */}
                        {order.delivery_address && (
                          <div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="font-medium text-blue-900 mb-2">Delivery Address</div>
                                  {(() => {
                                    const addressInfo = formatDeliveryAddress(order.delivery_address)
                                    if (typeof addressInfo === 'object' && addressInfo.formatted) {
                                      return (
                                        <div className="text-blue-800">
                                          <div className="font-medium">{addressInfo.formatted}</div>
                                          {addressInfo.landmark && (
                                            <div className="text-xs text-blue-600 mt-2">
                                              <strong>Landmark:</strong> {addressInfo.landmark}
                                            </div>
                                          )}
                                          {addressInfo.instructions && (
                                            <div className="text-xs text-blue-600 mt-1">
                                              <strong>Instructions:</strong> {addressInfo.instructions}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }
                                    return (
                                      <div className="text-blue-800">
                                        {addressInfo}
                                      </div>
                                    )
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-white">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Order Details - #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status and Actions */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedOrder.status)} size="lg">
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                  <div className="text-2xl font-bold text-green-600">
                    NPR {selectedOrder.total_amount}
                  </div>
                </div>
                
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(value) => {
                    handleStatusUpdate(selectedOrder.id, value)
                    setSelectedOrder({...selectedOrder, status: value})
                  }}
                >
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="pending" className="bg-white hover:bg-gray-100">Pending</SelectItem>
                    <SelectItem value="confirmed" className="bg-white hover:bg-gray-100">Confirmed</SelectItem>
                    <SelectItem value="shipped" className="bg-white hover:bg-gray-100">Shipped</SelectItem>
                    <SelectItem value="delivered" className="bg-white hover:bg-gray-100">Delivered</SelectItem>
                    <SelectItem value="cancelled" className="bg-white hover:bg-gray-100">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="w-5 h-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                    {selectedOrder.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Ordered: {new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                {selectedOrder.delivery_address && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const addressInfo = formatDeliveryAddress(selectedOrder.delivery_address)
                        if (typeof addressInfo === 'object' && addressInfo.formatted) {
                          return (
                            <div className="space-y-2">
                              <div className="font-medium">{addressInfo.formatted}</div>
                              {addressInfo.landmark && (
                                <div className="text-sm text-gray-600">
                                  <strong>Landmark:</strong> {addressInfo.landmark}
                                </div>
                              )}
                              {addressInfo.instructions && (
                                <div className="text-sm text-gray-600">
                                  <strong>Delivery Instructions:</strong> {addressInfo.instructions}
                                </div>
                              )}
                            </div>
                          )
                        }
                        return <div>{addressInfo}</div>
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5" />
                    Order Items ({selectedOrder.items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">NPR {item.price}</div>
                          <div className="text-sm text-gray-600">
                            NPR {(item.price / item.quantity).toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Total */}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">NPR {selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              {selectedOrder.payment_method && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Payment Method:</strong> {selectedOrder.payment_method}
                      </div>
                      {selectedOrder.payment_status && (
                        <div>
                          <strong>Payment Status:</strong> 
                          <Badge className={selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800 ml-2' : 'bg-yellow-100 text-yellow-800 ml-2'}>
                            {selectedOrder.payment_status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminAuthWrapper>
  )
}
