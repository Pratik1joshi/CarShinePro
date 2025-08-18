import Link from "next/link"
import { Facebook, Instagram, Phone, MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CP</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CarPolish Pro
              </span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Premium car care products for professional results. Trusted by car enthusiasts and professionals worldwide.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/1F9zAFzGGV/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Facebook className="w-6 h-6 text-blue-400" />
              </a>
              <a 
                href="https://wa.me/9779705387432" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-6 h-6 text-green-400" />
              </a>
              <div className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
                <Instagram className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/products" className="block text-gray-300 hover:text-blue-400 text-lg transition-colors hover:translate-x-2 transform duration-200">
                Products
              </Link>
              <Link href="/combo" className="block text-gray-300 hover:text-blue-400 text-lg transition-colors hover:translate-x-2 transform duration-200">
                Combo Deal
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-blue-400 text-lg transition-colors hover:translate-x-2 transform duration-200">
                About Us
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-blue-400 text-lg transition-colors hover:translate-x-2 transform duration-200">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Contact Us</h3>
            <div className="space-y-4">
              <a 
                href="https://wa.me/9779705387432" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-gray-300 text-lg group-hover:text-green-400 transition-colors">+977 9705387432</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-lg">
              © {new Date().getFullYear()} CarPolish Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-gray-400">Powered by</span>
              <a 
                href="https://aagat.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                aagat.dev
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
