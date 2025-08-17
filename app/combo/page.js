"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toast, useToast } from "@/components/ui/toast"
import { Check, Star, ShoppingCart, Gift } from "lucide-react"
import { useCart } from "@/contexts/cart-context-new"
import { useAuth } from "@/contexts/auth-context"

export default function ComboPage() {
  const [addingToCart, setAddingToCart] = useState(false)
  
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast, showToast, hideToast } = useToast()

  // The combo product ID from our mock products
  const comboProductId = "550e8400-e29b-41d4-a716-446655440004"

  const comboItems = [
    {
      name: "Premium Car Shiner",
      originalPrice: 29.99,
      description: "Professional grade shiner for brilliant, long-lasting shine",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Ceramic Coating Pro",
      originalPrice: 89.99,
      description: "Advanced ceramic coating for ultimate protection",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Deep Clean Formula",
      originalPrice: 24.99,
      description: "Powerful yet gentle cleaner for all surfaces",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Professional Detailing Brush",
      originalPrice: 19.99,
      description: "High-quality brush for detailed cleaning",
      image: "/placeholder.svg?height=200&width=200",
      isFree: true,
    },
  ]

  const totalOriginalPrice = comboItems.reduce((sum, item) => sum + item.originalPrice, 0)
  const comboPrice = 129.99
  const savings = totalOriginalPrice - comboPrice

  const handleAddToCart = async () => {
    setAddingToCart(true)
    
    try {
      const result = await addToCart(comboProductId, 1)
      if (result && result.success) {
        showToast('Combo deal added to cart successfully!', 'success')
      } else if (result && result.error) {
        // If the error is about redirecting to login, don't show it as an error
        if (result.error !== 'Redirecting to login...') {
          showToast(result.error, 'error')
        }
      }
    } catch (error) {
      console.error('Error adding combo to cart:', error)
      showToast('Failed to add combo to cart. Please try again.', 'error')
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white mb-4 text-lg px-4 py-2">🎉 LIMITED TIME OFFER</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Ultimate Car Care Combo</h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Everything you need for professional car care in one complete package
            </p>

            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold">NPR {comboPrice}</div>
                <div className="text-blue-200">Combo Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-blue-200 line-through">NPR {totalOriginalPrice.toFixed(2)}</div>
                <div className="text-blue-200">Individual Price</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-300">NPR {savings.toFixed(2)}</div>
                <div className="text-blue-200">You Save</div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-6"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              {addingToCart ? 'Adding to Cart...' : 'Get Combo Deal Now'}
            </Button>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Included</h2>
            <p className="text-xl text-gray-600">Four premium products that work together for complete car care</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {comboItems.map((item, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                {item.isFree && (
                  <Badge className="absolute top-4 right-4 bg-green-500 text-white z-10">
                    <Gift className="w-4 h-4 mr-1" />
                    FREE
                  </Badge>
                )}

                <div className="aspect-square relative bg-gray-100">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${item.isFree ? "text-green-600" : "text-blue-600"}`}>
                      {item.isFree ? "FREE" : `NPR ${item.originalPrice}`}
                    </span>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose the Combo?</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Complete Car Care Solution</h3>
                    <p className="text-gray-600">
                      Everything you need for washing, protecting, and shining your car in one convenient package.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Significant Savings</h3>
                    <p className="text-gray-600">
                      Save NPR {savings.toFixed(2)} compared to buying each product individually, plus get a free detailing
                      brush.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Professional Results</h3>
                    <p className="text-gray-600">
                      Products work synergistically together for the best possible results and long-lasting protection.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Perfect for Beginners</h3>
                    <p className="text-gray-600">
                      Complete step-by-step guide included to help you achieve professional results at home.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Car care combo in action"
                width={600}
                height={500}
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="font-bold">4.9/5</span>
                </div>
                <div className="text-sm text-gray-600">67 combo reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Use Your Combo</h2>
            <p className="text-xl text-gray-600">Simple 4-step process for professional results</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Clean</h3>
              <p className="text-gray-600">Start with Deep Clean Formula to remove dirt and contaminants</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">Protect</h3>
              <p className="text-gray-600">Apply Ceramic Coating Pro for long-lasting protection</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Shine</h3>
              <p className="text-gray-600">Finish with Premium Car Shiner for brilliant gloss</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Detail</h3>
              <p className="text-gray-600">Use the free brush for detailed cleaning and finishing touches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Car?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've achieved professional results with our Ultimate Car Care Combo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-6"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              {addingToCart ? 'Adding to Cart...' : `Order Now - NPR ${comboPrice}`}
            </Button>
            <div className="text-blue-100">✓ Free shipping • ✓ 30-day guarantee • ✓ Expert support</div>
          </div>

          <div className="text-sm text-blue-200">
            Limited time offer. Save NPR {savings.toFixed(2)} compared to individual purchases.
          </div>
        </div>
      </section>
    </div>
  )
}
