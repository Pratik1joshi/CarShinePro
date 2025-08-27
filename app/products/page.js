"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toast, useToast } from "@/components/ui/toast"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context-new"
import { useAuth } from "@/contexts/auth-context"

// Static products data
const staticProducts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Nodi Shine Dashboard Shiner",
    description:
      "Professional dashboard and interior shiner that gives your car's dashboard a brilliant, long-lasting shine. Protects against UV damage and dust accumulation.",
    price: 900,
    originalPrice: null,
    image: "/products/nodi-shine-dashboard.png",
    category: "shiner",
    rating: 4.8,
    reviews: 124,
    inStock: true,
  },
  // {
  //   id: "550e8400-e29b-41d4-a716-446655440002",
  //   name: "Nodi Shine Waterless Auto Guard",
  //   description:
  //     "Advanced waterless car wash and protection spray. Cleans, shines, and protects your vehicle's paint without water. Perfect for quick touch-ups and regular maintenance.",
  //   price: 799,
  //   originalPrice: null,
  //   image: "/products/nodi-shine-waterless3.png",
  //   category: "spray",
  //   rating: 4.9,
  //   reviews: 89,
  //   inStock: true,
  // },
  // {
  //   id: "550e8400-e29b-41d4-a716-446655440003",
  //   name: "Nodi Shine Stain Remover",
  //   description:
  //     "Powerful stain remover that effectively removes stubborn stains, dirt, and grime from car interiors and exteriors. Safe for all surfaces including fabric, leather, and vinyl.",
  //   price: 499,
  //   originalPrice: null,
  //   image: "/products/nodi-shine-remover-3.png",
  //   category: "cleaner",
  //   rating: 4.7,
  //   reviews: 156,
  //   inStock: true,
  // },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Star Gold Complete Car Care Kit",
    description:
      "Complete professional car care package including Dashboard & Vinyl Leather Shiner, Body Glass Cleaner, and Stain Remover. Everything you need for comprehensive car detailing.",
    price: 2499,
    originalPrice: 2750,
    image: "/products/combo5.png",
    category: "combo",
    rating: 4.9,
    reviews: 67,
    inStock: true,
    isCombo: true,
  },
  // {
  //   id: "550e8400-e29b-41d4-a716-446655440005",
  //   name: "Star Gold Dashboard & Vinyl Leather Shiner",
  //   description:
  //     "Premium dashboard and leather care product that cleans, shines, and protects all interior surfaces. Ideal for dashboards, vinyl, and leather upholstery.",
  //   price: 649,
  //   originalPrice: null,
  //   image: "/products/star-gold-dashboard.jpg",
  //   category: "shiner",
  //   rating: 4.8,
  //   reviews: 98,
  //   inStock: true,
  // },
  // {
  //   id: "550e8400-e29b-41d4-a716-446655440006",
  //   name: "Star Gold Body Glass Cleaner",
  //   description:
  //     "Professional glass and body cleaner that provides crystal clear finish. Removes water spots, dirt, and grime from glass, mirrors, and painted surfaces.",
  //   price: 549,
  //   originalPrice: null,
  //   image: "/products/star-gold-glass.jpg",
  //   category: "spray",
  //   rating: 4.6,
  //   reviews: 73,
  //   inStock: true,
  // },
]

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    // Use static products instead of loading from database
    setProducts(staticProducts)
    setLoading(false)
  }, [])

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart(product.id, 1)
      if (result && result.success) {
        showToast(`${product.name} added to cart!`, 'success')
      } else if (result && result.error) {
        // If the error is about redirecting to login, don't show it as an error
        if (result.error !== 'Redirecting to login...') {
          showToast(result.error, 'error')
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      showToast('Failed to add item to cart. Please try again.', 'error')
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
      
      {/* Header */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Premium Car Care Products</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Authentic Nodi Shine and Star Gold products designed specifically for Nepal's climate. Professional-grade car care for brilliant shine and lasting protection.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden bg-white">
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow bg-white cursor-pointer">
                  <div className="relative">
                    <div className="aspect-square relative">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    {product.isCombo && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs">COMBO DEAL</Badge>
                    )}
                    {product.originalPrice && (
                      <Badge className="absolute top-3 right-3 bg-green-500 text-white text-xs">
                        SAVE रु{(product.originalPrice - product.price).toLocaleString()}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-blue-600">रु{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">रु{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(product)
                          }}
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="w-3 h-3 mr-2" />
                          Add to Cart
                        </Button>
                      </div>

                      {product.inStock ? (
                        <div className="text-green-600 text-xs font-medium">✓ In Stock</div>
                      ) : (
                        <div className="text-red-600 text-xs font-medium">Out of Stock</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing the Right Product?</h2>
          <p className="text-lg mb-6 text-blue-100">
            Our Nepal car care experts are here to help you find the perfect products for your vehicle's needs.
          </p>
          <a 
            href="https://wa.me/9779705387432" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Contact Our Nepal Experts
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
