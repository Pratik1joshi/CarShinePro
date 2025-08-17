"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  ShoppingBag, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin,
  Phone,
  Mail,
  Calendar
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getOrders } from "@/lib/supabase"

export default function UserOrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAdmin } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing loading to false')
        setLoading(false)
      }
    }, 15000) // 15 second timeout

    return () => clearTimeout(timeout)
  }, [loading])

  useEffect(() => {
    console.log('useEffect triggered:', { authLoading, user: !!user, isAdmin })
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, waiting...')
      return
    }
    
    // Redirect to login if no user
    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/login?redirect=/orders')
      return
    }
    
    // Redirect admins to admin orders page
    if (isAdmin) {
      console.log('Admin user detected, redirecting to admin orders')
      router.push('/admin/orders')
      return
    }
    
    // Only load orders if we have a valid user with ID
    if (user && user.id) {
      console.log('Loading orders for valid user')
      loadOrders()
    } else {
      console.log('User missing ID, cannot load orders')
      setLoading(false)
    }
  }, [user?.id, authLoading, isAdmin]) // Only depend on user.id to prevent infinite loops

  const loadOrders = async () => {
    // Don't load orders if user is not available
    if (!user || !user.id) {
      console.log('User not available for loading orders')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('Loading orders for user:', user.id)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const ordersPromise = getOrders(user.id)
      
      const { data, error } = await Promise.race([ordersPromise, timeoutPromise])
      
      if (error) {
        console.error('Error loading orders:', error)
        setOrders([])
      } else {
        console.log('Orders loaded successfully:', data)
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
      
      // If it's a timeout, show a specific message
      if (error.message === 'Request timeout') {
        console.error('Orders request timed out')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <Package className="w-4 h-4" />
      case 'cancelled':
        return <Package className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading your orders...</h1>
              <p className="text-gray-600">Please wait while we fetch your order history.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to login...</h1>
              <p className="text-gray-600">Please sign in to view your orders.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href="/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shopping
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600">Track and manage your order history</p>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">No orders yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CardTitle className="text-lg">
                          Order #{order.id}
                        </CardTitle>
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 px-3 py-1`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      <h4 className="font-medium text-gray-900">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 relative bg-gray-200 rounded-lg overflow-hidden">
                              <Image 
                                src={item.product_image || "/placeholder.svg"} 
                                alt={item.product_name} 
                                fill 
                                className="object-cover" 
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-600">Price: NPR {item.product_price}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                NPR {(item.product_price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Delivery Information */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Delivery Information
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium">{order.customer_phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{order.customer_email}</p>
                            </div>
                          </div>
                          {order.delivery_address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-medium">
                                  {order.delivery_address.tole}, Ward {order.delivery_address.ward}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {order.delivery_address.municipality}, {order.delivery_address.district}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {order.delivery_address.province}
                                </p>
                                {order.delivery_address.landmark && (
                                  <p className="text-sm text-gray-500">
                                    Landmark: {order.delivery_address.landmark}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Order Summary</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">NPR {(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Charge</span>
                            <span className="font-medium">NPR {(order.delivery_charge || 0).toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total</span>
                              <span>NPR {(order.total_amount || 0).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-center pt-2">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Cash on Delivery (COD)
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Status Timeline */}
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium text-gray-900 mb-4">Order Status</h4>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="font-medium">
                            {order.status === 'pending' && 'Order Placed - Waiting for confirmation'}
                            {order.status === 'confirmed' && 'Order Confirmed - Preparing for shipment'}
                            {order.status === 'shipped' && 'Order Shipped - On the way'}
                            {order.status === 'delivered' && 'Order Delivered - Completed'}
                            {order.status === 'cancelled' && 'Order Cancelled'}
                          </span>
                        </div>
                      </div>
                      
                      {order.status === 'pending' && (
                        <p className="text-sm text-gray-600 mt-2">
                          We'll contact you at {order.customer_phone} to confirm your order and delivery details.
                        </p>
                      )}
                      
                      {order.status === 'shipped' && (
                        <p className="text-sm text-gray-600 mt-2">
                          Your order is on the way! Please be available for delivery.
                        </p>
                      )}
                      
                      {order.status === 'delivered' && (
                        <p className="text-sm text-green-700 mt-2">
                          Thank you for your order! We hope you enjoy your purchase.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
