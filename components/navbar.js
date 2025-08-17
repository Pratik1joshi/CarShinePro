"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, Menu, X, LogOut, Shield, Package } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context-new"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading, isAdmin } = useAuth()
  const { itemCount } = useCart()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-xl sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-white font-bold text-lg">CP</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CarPolish Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200">
              Products
            </Link>
            <Link href="/combo" className="relative text-gray-700 hover:text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200">
              Combo Deal
              <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 animate-pulse">
                HOT
              </Badge>
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200">
              About
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart - only show for non-admin users */}
            {user && !isAdmin && (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 p-3 rounded-xl">
                  <ShoppingCart className="w-6 h-6" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            {/* My Orders - only show for non-admin users */}
            {user && !isAdmin && (
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="hover:bg-green-50 px-4 py-2 rounded-xl text-green-600 hover:text-green-700 font-medium">
                  <Package className="w-5 h-5 mr-2" />
                  My Orders
                </Button>
              </Link>
            )}
            
            {user ? (
              <>
                {/* Admin Dashboard Link */}
                {isAdmin && (
                  <Link href="/admin">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-orange-50 px-4 py-2 rounded-xl text-orange-600 hover:text-orange-700 font-medium"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  {isAdmin && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 ml-2">
                      Admin
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="hover:bg-red-50 px-4 py-2 rounded-xl text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-gray-50 px-4 py-2 rounded-xl">
                    <User className="w-5 h-5 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-all">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-all">
                Products
              </Link>
              <Link href="/combo" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-all">
                Combo Deal
                <Badge className="ml-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1">
                  HOT
                </Badge>
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-all">
                About
              </Link>
              <div className="flex flex-col space-y-3 pt-6 border-t border-gray-100">
                {/* Cart - only show for non-admin users */}
                {user && !isAdmin && (
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-gray-50 py-3 px-4 rounded-lg">
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      Cart ({itemCount})
                    </Button>
                  </Link>
                )}
                
                {/* My Orders - only show for non-admin users */}
                {user && !isAdmin && (
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-green-50 py-3 px-4 rounded-lg text-green-600 hover:text-green-700 font-medium">
                      <Package className="w-5 h-5 mr-3" />
                      My Orders
                    </Button>
                  </Link>
                )}
                
                {user ? (
                  <>
                    {/* Admin Dashboard Link - Mobile */}
                    {isAdmin && (
                      <Link href="/admin">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start hover:bg-orange-50 py-3 px-4 rounded-lg text-orange-600 hover:text-orange-700 font-medium"
                        >
                          <Shield className="w-5 h-5 mr-3" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                      {isAdmin && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 ml-auto">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSignOut}
                      className="w-full justify-start hover:bg-red-50 py-3 px-4 rounded-lg text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-gray-50 py-3 px-4 rounded-lg">
                        <User className="w-5 h-5 mr-3" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-lg shadow-lg">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
