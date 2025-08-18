"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  Shield,
  CheckCircle
} from "lucide-react"
import { useCart } from "@/contexts/cart-context-new"
import { useAuth } from "@/contexts/auth-context"
import { createOrder } from "@/lib/supabase"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, getCartTotal, loading: cartLoading } = useCart()
  const { user, loading: authLoading } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    municipality: '',
    ward: '',
    tole: '',
    landmark: '',
    deliveryInstructions: '',
    paymentMethod: 'cod'
  })
  const [errors, setErrors] = useState({})

  const cartItems = items || []
  const subtotal = getCartTotal()
  const deliveryCharge = 150 // रु150 delivery charge
  const total = subtotal + deliveryCharge

  // Debug logging
  console.log('Checkout Debug:', {
    cartLoading,
    authLoading,
    cartItemsLength: cartItems.length,
    user: !!user,
    subtotal,
    pageReady,
    items: cartItems
  })

  // Nepal provinces and some major districts
  const nepalLocations = {
    "Province 1": ["Jhapa", "Ilam", "Panchthar", "Taplejung", "Morang", "Sunsari", "Dhankuta", "Terhathum", "Sankhuwasabha", "Bhojpur", "Solukhumbu", "Okhaldhunga", "Khotang", "Udayapur"],
    "Madhesh Province": ["Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi", "Bara", "Parsa", "Rautahat"],
    "Bagmati Province": ["Kathmandu", "Lalitpur", "Bhaktapur", "Nuwakot", "Rasuwa", "Dhading", "Chitwan", "Makwanpur", "Sindhuli", "Ramechhap", "Dolakha", "Sindhupalchok", "Kavrepalanchok"],
    "Gandaki Province": ["Gorkha", "Lamjung", "Tanahu", "Syangja", "Kaski", "Manang", "Mustang", "Myagdi", "Parbat", "Baglung", "Nawalpur"],
    "Lumbini Province": ["Kapilvastu", "Parasi", "Rupandehi", "Palpa", "Arghakhanchi", "Gulmi", "Pyuthan", "Rolpa", "Eastern Rukum", "Banke", "Bardiya", "Dang"],
    "Karnali Province": ["Western Rukum", "Salyan", "Dolpa", "Humla", "Jumla", "Kalikot", "Mugu", "Surkhet", "Dailekh", "Jajarkot"],
    "Sudurpashchim Province": ["Kailali", "Kanchanpur", "Dadeldhura", "Baitadi", "Darchula", "Bajhang", "Bajura", "Achham", "Doti"]
  }

  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) return
    
    // Only redirect to login if auth has finished loading and user is definitely not authenticated
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout')
      return
    }
    
    // Pre-fill user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || ''
      }))
    }
  }, [user, router, authLoading])

  // Separate useEffect to handle cart loading logic
  useEffect(() => {
    // Don't do anything if auth is still loading or user is not available yet
    if (authLoading || !user) return
    
    // If cart is still loading, don't make any decisions yet
    if (cartLoading) {
      setPageReady(false)
      return
    }
    
    // Cart has finished loading, now decide what to do
    setPageReady(true)
    
    // If cart is empty after loading, redirect to cart page
    if (cartItems.length === 0) {
      console.log('Redirecting to cart - no items found after loading')
      const timer = setTimeout(() => {
        router.push('/cart')
      }, 500) // Small delay for better UX
      
      return () => clearTimeout(timer)
    }
  }, [cartLoading, cartItems.length, router, user, authLoading])

  const validateNepaliPhone = (phone) => {
    // Nepali phone number validation (10 digits starting with 98 or 97)
    const nepaliPhoneRegex = /^(98|97)\d{8}$/
    return nepaliPhoneRegex.test(phone)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validateNepaliPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Nepali phone number (starting with 98 or 97)'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.province) {
      newErrors.province = 'Province is required'
    }

    if (!formData.district) {
      newErrors.district = 'District is required'
    }

    if (!formData.municipality.trim()) {
      newErrors.municipality = 'Municipality/VDC is required'
    }

    if (!formData.ward.trim()) {
      newErrors.ward = 'Ward number is required'
    }

    if (!formData.tole.trim()) {
      newErrors.tole = 'Tole/Area is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const orderData = {
        user_id: user.id,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: {
          province: formData.province,
          district: formData.district,
          municipality: formData.municipality,
          ward: formData.ward,
          tole: formData.tole,
          landmark: formData.landmark,
          instructions: formData.deliveryInstructions
        },
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          total_price: item.product_price * item.quantity
        })),
        subtotal: subtotal,
        delivery_charge: deliveryCharge,
        total_amount: total,
        payment_method: 'cod',
        status: 'pending'
      }

      const { data, error } = await createOrder(orderData)
      
      if (error) {
        throw error
      }

      // Clear cart and show success
      await clearCart()
      setOrderSuccess(true)
      
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. We'll contact you at {formData.phone} to confirm delivery details.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-green-800 font-medium">Your order will be delivered via Cash on Delivery (COD)</p>
                <p className="text-green-700 text-sm mt-1">Total Amount: रु{total.toFixed(2)}</p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/orders">View My Orders</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while auth or cart is loading OR if page is not ready
  if (authLoading || cartLoading || !pageReady || (!authLoading && !user)) {
    // If auth finished loading and there's no user, this will redirect in useEffect
    if (!authLoading && !user) {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to login...</h1>
                <p className="text-gray-600">Please wait while we redirect you to sign in.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {authLoading ? 'Checking authentication...' : cartLoading ? 'Loading your cart...' : 'Preparing checkout...'}
              </h1>
              <p className="text-gray-600">Please wait while we prepare your checkout.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Only show empty cart message if we're absolutely sure everything is loaded and cart is empty
  if (pageReady && !cartLoading && !authLoading && user && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-4">Add some items to your cart before proceeding to checkout.</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="98XXXXXXXX (10 digits)"
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    <p className="text-gray-500 text-sm mt-1">Enter 10-digit Nepali number starting with 98 or 97</p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="province">Province *</Label>
                      <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                        <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select Province" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(nepalLocations).map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                    </div>

                    <div>
                      <Label htmlFor="district">District *</Label>
                      <Select 
                        value={formData.district} 
                        onValueChange={(value) => handleInputChange('district', value)}
                        disabled={!formData.province}
                      >
                        <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.province && nepalLocations[formData.province]?.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="municipality">Municipality/VDC *</Label>
                      <Input
                        id="municipality"
                        value={formData.municipality}
                        onChange={(e) => handleInputChange('municipality', e.target.value)}
                        placeholder="e.g., Kathmandu Metropolitan City"
                        className={errors.municipality ? 'border-red-500' : ''}
                      />
                      {errors.municipality && <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>}
                    </div>

                    <div>
                      <Label htmlFor="ward">Ward No. *</Label>
                      <Input
                        id="ward"
                        value={formData.ward}
                        onChange={(e) => handleInputChange('ward', e.target.value)}
                        placeholder="e.g., 5"
                        className={errors.ward ? 'border-red-500' : ''}
                      />
                      {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tole">Tole/Area *</Label>
                    <Input
                      id="tole"
                      value={formData.tole}
                      onChange={(e) => handleInputChange('tole', e.target.value)}
                      placeholder="e.g., Thamel, Baneshwor"
                      className={errors.tole ? 'border-red-500' : ''}
                    />
                    {errors.tole && <p className="text-red-500 text-sm mt-1">{errors.tole}</p>}
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input
                      id="landmark"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Near temple, school, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                    <Textarea
                      id="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                      placeholder="Any special delivery instructions..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-6 h-6 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-orange-900">Cash on Delivery (COD)</h3>
                        <p className="text-orange-700 text-sm">Pay when your order arrives at your doorstep</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Secure and convenient payment option</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 relative bg-gray-100 rounded-lg overflow-hidden">
                          <Image 
                            src={item.product_image || "/placeholder.svg"} 
                            alt={item.product_name} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product_name}</h4>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">रु{(item.product_price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">रु{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charge</span>
                      <span className="font-semibold">रु{deliveryCharge}</span>
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>रु{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleSubmitOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Placing Order...' : 'Place Order (COD)'}
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    By placing this order, you agree to our terms and conditions
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
