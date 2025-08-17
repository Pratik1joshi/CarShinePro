import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Award, Users, Truck, Star, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "All our products come with a 100% satisfaction guarantee and premium quality assurance.",
    },
    {
      icon: Award,
      title: "Professional Grade",
      description: "Used by professional detailers and car enthusiasts worldwide for superior results.",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Our team of car care experts is always ready to help you achieve the perfect finish.",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Free shipping on orders over NPR 100 with fast, reliable delivery to your door.",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "50,000+", label: "Cars Polished" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "5 Years", label: "In Business" },
  ]

  const team = [
    {
      name: "John Smith",
      role: "Founder & CEO",
      image: "/placeholder.svg?height=200&width=200",
      description: "20+ years in automotive care industry",
    },
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      image: "/placeholder.svg?height=200&width=200",
      description: "Expert in chemical formulation",
    },
    {
      name: "Mike Wilson",
      role: "Customer Success",
      image: "/placeholder.svg?height=200&width=200",
      description: "Dedicated to customer satisfaction",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mb-4">About CarPolish Pro</Badge>
            <h1 className="text-3xl lg:text-5xl font-bold mb-6">
              Passionate About
              <span className="text-blue-400 block">Perfect Car Care</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              We're dedicated to providing professional-grade car care products that help you achieve showroom-quality
              results at home. Our mission is to make premium car care accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2019 by car enthusiasts who were frustrated with the lack of professional-grade car care
                  products available to consumers, CarPolish Pro was born from a simple mission: to bring professional
                  detailing results to your driveway.
                </p>
                <p>
                  After years of research and development, working closely with professional detailers and chemical
                  engineers, we created our signature line of car care products that deliver exceptional results while
                  being easy to use for car owners of all skill levels.
                </p>
                <p>
                  Today, we're proud to serve thousands of customers worldwide, helping them maintain their vehicles
                  with the same quality products used by professional detailing shops.
                </p>
              </div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/products">Shop Our Products</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Car detailing process"
                width={500}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Why Choose CarPolish Pro?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best car care experience through quality products and exceptional
              service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600">The principles that guide everything we do</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Quality First</h3>
                  <p className="text-gray-600">
                    We never compromise on quality. Every product is rigorously tested to ensure it meets our high
                    standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Customer Success</h3>
                  <p className="text-gray-600">
                    Your success is our success. We're here to support you every step of the way.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    We continuously innovate to bring you the latest advances in car care technology.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Excellence</h3>
                  <p className="text-gray-600">
                    We strive for excellence in everything we do, from product development to customer service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Experience the Difference?</h2>
          <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust CarPolish Pro for their car care needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/products">Shop Products</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/combo">View Combo Deal</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
