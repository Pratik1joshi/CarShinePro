"use client"

// Updated to handle Next.js 15 params requirement and improved error handling
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ShoppingCart, Heart, Minus, Plus, Shield, Truck, RotateCcw } from "lucide-react"
import { useCart } from "@/contexts/cart-context-new"
import { useAuth } from "@/contexts/auth-context"
import { Toast, useToast } from "@/components/ui/toast"
import { getProduct } from "@/lib/supabase"

export default function ProductDetailPage({ params }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [productId, setProductId] = useState(null)
  
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    const loadParams = async () => {
      try {
        const resolvedParams = await params
        if (resolvedParams && resolvedParams.id) {
          console.log('Resolved product ID from params:', resolvedParams.id)
          setProductId(resolvedParams.id)
        } else {
          console.error('Invalid or missing ID in params:', resolvedParams)
          showToast('Invalid product ID. Showing default product.', 'error')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error resolving params:', error)
        showToast('Error loading product. Showing default product.', 'error')
        setLoading(false)
      }
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      loadProduct()
    } else {
      // If no productId is available, use the fallback
      setProduct(fallbackProduct)
      setLoading(false)
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      // Validate productId
      if (!productId) {
        console.warn('Attempting to load product with invalid ID')
        showToast('Invalid product ID. Showing default product.', 'error')
        setProduct({...fallbackProduct, id: 'default'})
        setLoading(false)
        return
      }
      
      console.log('Loading static product with ID:', productId)
      
      // For static products, we use a try/catch to handle any potential errors
      try {
        const { data, error } = await getProduct(productId)
        
        if (error) {
          // If there's an error object with message
          console.warn('Product not found in static data:', error.message)
          setProduct({...fallbackProduct, id: productId})
        } else if (data) {
          console.log('Static product loaded successfully:', data.name)
          setProduct(data)
        } else {
          console.log('No product data found in static data')
          setProduct({...fallbackProduct, id: productId})
        }
      } catch (err) {
        console.error('Error processing static product:', err)
        setProduct({...fallbackProduct, id: productId})
      }
    } catch (error) {
      console.error('Exception in loadProduct:', error)
      setProduct({...fallbackProduct, id: productId})
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    
    try {
      const result = await addToCart(product.id, quantity)
      if (result && result.success) {
        showToast(`Added ${quantity} item(s) to cart successfully!`, 'success')
      } else if (result && result.error) {
        // If the error is about redirecting to login, don't show it as an error
        if (result.error !== 'Redirecting to login...') {
          showToast(result.error, 'error')
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      showToast('Failed to add item to cart. Please try again.', 'error')
    } finally {
      setAddingToCart(false)
    }
  }

  // Fallback product data
  const fallbackProduct = {
    id: productId || 'default',
    name: "Premium Car Shiner",
    description:
      "Professional grade car shiner that gives your vehicle a brilliant, long-lasting shine. Perfect for all paint types.",
    price: 29.99,
    originalPrice: null,
    // Ensure both image and images are available for compatibility
    image: "/placeholder.svg?height=600&width=600",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    category: "shiner",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    stock: 50, // For compatibility with mockProducts
    stockCount: 50, 
    features: [
      "Professional grade formula",
      "Long-lasting shine",
      "Safe for all paint types",
      "Easy application",
      "UV protection",
    ],
    specifications: {
      Volume: "16 fl oz (473ml)",
      Type: "Liquid Polish",
      Application: "Spray & Wipe",
      Coverage: "Up to 10 vehicles",
      "Drying Time": "5-10 minutes",
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, Math.min(product.stockCount, quantity + change)))
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative bg-white rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-blue-600" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-4">{product.category.toUpperCase()}</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-blue-600">रु{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">रु{product.originalPrice}</span>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">{product.description}</p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.stockCount} available</span>
              </div>

              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addingToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addingToCart ? 'Adding...' : `Add to Cart - रु${(product.price * quantity).toFixed(2)}`}
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Quality Guarantee</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Free Shipping</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <RotateCcw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium">30-Day Returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Product Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Our Premium Car Shiner is the result of years of research and development in automotive care
                      technology. This professional-grade formula is designed to deliver exceptional results that rival
                      those achieved by professional detailing services.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      The advanced polymer technology creates a protective barrier that not only enhances the shine but
                      also provides long-lasting protection against environmental contaminants, UV rays, and everyday
                      wear and tear.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Whether you're preparing for a car show or simply want to maintain your vehicle's appearance, this
                      shiner delivers consistent, professional results every time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-900">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>
                  <div className="space-y-6">
                    {/* Sample reviews */}
                    <div className="border-b pb-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium">John D.</span>
                        <span className="text-gray-500 text-sm">Verified Purchase</span>
                      </div>
                      <p className="text-gray-600">
                        "Absolutely amazing product! My car has never looked better. The shine lasts for weeks and
                        application is so easy. Highly recommend!"
                      </p>
                    </div>

                    <div className="border-b pb-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="font-medium">Sarah M.</span>
                        <span className="text-gray-500 text-sm">Verified Purchase</span>
                      </div>
                      <p className="text-gray-600">
                        "Great product overall. Easy to use and gives a nice shine. Only reason for 4 stars is the
                        price, but quality is definitely there."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
