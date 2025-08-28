"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { useCart } from "@/contexts/cart-context-new"
import { useAuth } from "@/contexts/auth-context"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart()
  const { user, isAdmin, loading } = useAuth()

  // Redirect admins to admin panel
  useEffect(() => {
    if (loading) return
    
    if (isAdmin) {
      router.push('/admin')
      return
    }
  }, [isAdmin, loading, router])

  const cartItems = items || []
  const subtotal = getCartTotal()
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }
    await updateQuantity(cartItemId, newQuantity)
  }

  const handleRemoveItem = async (cartItemId) => {
    await removeFromCart(cartItemId)
  }

  const handleCheckout = async () => {
    if (!user) {
      // Redirect to login with checkout redirect
      window.location.href = '/login?redirect=/checkout'
      return
    }
    
    // Redirect to checkout page
    window.location.href = '/checkout'
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <Button variant="ghost" asChild className="flex-shrink-0">
              <Link href="/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 sm:p-6">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={item.product_image || "/placeholder.svg"} alt={item.product_name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-gray-900 truncate">{item.product_name}</h3>
                          <p className="text-blue-600 font-bold text-sm">रु{item.product_price}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                            className="w-12 text-center border-0 focus:ring-0 text-sm"
                            min="0"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="text-lg font-bold text-gray-900">
                          रु{(item.product_price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.product_image || "/placeholder.svg"} alt={item.product_name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900">{item.product_name}</h3>
                        <p className="text-blue-600 font-bold">रु{item.product_price}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                            className="w-16 text-center border-0 focus:ring-0"
                            min="0"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-lg font-bold text-gray-900 min-w-[80px] text-right">
                          रु{(item.product_price * item.quantity).toFixed(2)}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-4">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">रु{subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">{shipping === 0 ? "FREE" : `रु${shipping.toFixed(2)}`}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">रु{tax.toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>रु{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {shipping > 0 && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        Add रु{(100 - subtotal).toFixed(2)} more for free shipping!
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleCheckout}
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>

                    <div className="text-center text-xs sm:text-sm text-gray-500">Secure checkout with SSL encryption</div>
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
