import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Sparkles, Zap } from "lucide-react"

export default function HomePage() {
  const products = [
    {
      id: 1,
      name: "Nodi Shine Dashboard Shiner",
      description: "Professional dashboard and interior shiner with UV protection",
      price: 599,
      image: "/products/nodi-shine-dashboard.png",
      category: "shiner",
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: "Nodi Shine Waterless Auto Guard",
      description: "Advanced waterless car wash and protection spray",
      price: 799,
      image: "/products/nodi-shine-waterless3.png",
      category: "spray",
      rating: 4.9,
      reviews: 89
    },
    {
      id: 3,
      name: "Nodi Shine Stain Remover",
      description: "Powerful stain remover for all car surfaces",
      price: 499,
      image: "/products/nodi-shine-remover-3.png",
      category: "cleaner",
      rating: 4.7,
      reviews: 156
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-white/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
        <div className="relative container mx-auto px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 px-4 py-2 text-sm font-semibold border border-blue-200">
                  ✨ Professional Car Care
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-gray-900">
                  Make Your Car
                  <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text block">
                    Shine Like New
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Premium Nodi Shine and Star Gold car care products trusted by professionals across Nepal. Get that showroom finish with our advanced
                  formulas designed for lasting protection and brilliant shine.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 px-8 py-4 text-lg font-semibold bg-white/80 backdrop-blur-sm"
                >
                  <Link href="/combo">View Combo Deal</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-500 text-lg font-medium">4.9/5 Rating</span>
                </div>
                <div className="text-gray-500 text-lg">
                  <span className="font-bold text-gray-700 text-xl">10,000+</span> Happy Customers
                </div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="relative">
                <Image
                  src="/products/combo5.png"
                  alt="Luxury car with perfect shine"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-xl">
                  <div className="text-2xl font-bold">Save रु251</div>
                  <div className="text-sm font-medium">Star Gold Combo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combo Offer Section - Moved after Hero */}
      <section className="py-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 text-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/50"></div>
        <div className="relative container mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <Badge className="bg-blue-100 backdrop-blur-sm text-blue-700 border border-blue-200 mb-4 px-4 py-2 text-lg font-semibold">
                🎯 Limited Time Offer
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">Star Gold Complete Car Care Kit</h2>
              <p className="text-xl mb-8 text-gray-600 leading-relaxed">
                Get all premium Star Gold products plus professional tools. Save रु251 compared to buying
                separately and transform your car care routine with authentic Nepal products!
              </p>

                  <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-lg text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Nodi Shine Dashboard Shiner (रु599)</span>
                </div>
                <div className="flex items-center gap-3 text-lg text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Star Gold Complete Car Care (रु1,899)</span>
                </div>
                <div className="flex items-center gap-3 text-lg text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Nodi Shine Stain Remover (रु499)</span>
                </div>
                <div className="flex items-center gap-3 text-lg text-gray-700">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="font-semibold">Professional Detailing Brush (FREE)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="text-4xl font-bold text-gray-900">रु2,499</div>
                <div className="text-2xl text-gray-500 line-through">रु2,750</div>
                <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-lg px-3 py-1 font-bold">Save रु251</Badge>
              </div>

              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
                <Link href="/combo">Get Combo Deal Now</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="relative">
                <Image
                  src="/products/combo3.jpg"
                  alt="Car care combo package"
                  width={400}
                  height={400}
                  className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-10 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  LIMITED TIME!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 px-4 py-2 text-sm font-semibold mb-4">
              Our Products
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Premium Car Care Solutions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Each product is specially formulated for maximum effectiveness and designed to give your car the ultimate protection and shine</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-0 shadow-lg">
                  <div className="aspect-square relative overflow-hidden">
                    <Image 
                      src={product.image || "/placeholder.svg"} 
                      alt={product.name} 
                      fill 
                      className="object-contain group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50">
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">रु{product.price.toLocaleString()}</span>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Why Choose Our Products */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 px-4 py-2 text-sm font-semibold mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Why Our Products Stand Out</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional-grade formulas designed for superior results and long-lasting protection that exceeds industry standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Premium Shine</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Achieve a mirror-like finish that lasts for months with our advanced shining formula. Professional results guaranteed every time.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">Ultimate Protection</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Ceramic coating technology that protects against UV rays, scratches, and environmental damage for years of lasting protection.
              </p>
            </div>

            <div className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Easy Application</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Simple application process that delivers professional results every time. No special equipment needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
