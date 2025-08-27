import { createClient } from "@supabase/supabase-js"

// DEVELOPMENT MODE TOGGLE - Set to false to use real Supabase for dynamic data
// Products will always remain static regardless of this setting
const FORCE_DEV_MODE = false;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase credentials are provided
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here'

if (FORCE_DEV_MODE) {
  console.warn('⚠️ DEVELOPMENT MODE ENABLED: Using mock data for all operations')
} else if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase credentials not configured. Using mock data for development.')
} else {
  console.log('✅ DYNAMIC MODE ENABLED: Using Supabase for users, orders, cart. Products remain static.')
}

// Create a mock Supabase client with all the necessary methods
const createMockSupabaseClient = () => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        // Return an object with a mock unsubscribe method
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => console.log('Mock unsubscribe called') 
            } 
          } 
        };
      },
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null })
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({ data: null, error: null }),
        single: () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ data: null, error: null })
          })
        })
      }),
      delete: () => ({
        eq: () => ({ error: null })
      })
    }),
    rpc: () => ({ data: null, error: null })
  };
};

// Use a real Supabase client if configured, otherwise use our mock client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : createMockSupabaseClient();

// Helper function to create mock responses
const createMockResponse = (data = null, error = null) => ({ data, error })

// Mock data for development - Only selling Combo and Dashboard Shiner
const mockProducts = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    shortId: "1",  // Simplified ID for easy access
    name: "Nodi Shine Dashboard Shiner",
    description: "Professional dashboard and interior shiner that gives your car's dashboard a brilliant, long-lasting shine. Protects against UV damage and dust accumulation.",
    price: 900, // Updated NPR pricing
    originalPrice: null,
    image: "/products/nodi-shine-dashboard.png", // Real product image
    images: [
      "/products/nodi-shine-dashboard.png",
      "/products/nodi-shine-dashboard-2.jpg",
      "/products/nodi-shine-dashboard-3.png",
      "/products/nodi-shine-dashboard-4.jpg"
    ],
    category: "shiner",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    stock: 50,
    created_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    shortId: "4",  // Simplified ID for easy access
    name: "Star Gold Complete Car Care Kit",
    description: "Complete professional car care package including Dashboard & Vinyl Leather Shiner, Body Glass Cleaner, and Stain Remover. Everything you need for comprehensive car detailing.",
    price: 2499, // NPR pricing
    originalPrice: 2750,
    image: "/products/combo5.png", // Real product image
    images: [
      "/products/combo5.png",
      "/products/combo3.jpg",
      "/products/star-gold-combo.jpg",
      "/products/star-gold-combo-2.jpg"
    ],
    category: "combo",
    rating: 4.9,
    reviews: 67,
    inStock: true,
    isCombo: true,
    stock: 25,
    created_at: new Date().toISOString()
  }
]

// ========== AUTH HELPERS ==========

export const signUp = async (email, password, fullName) => {
  try {
    // For dynamic mode, always try Supabase first
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      try {
        const response = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              is_admin: email === 'admin@carpolish.com'
            },
          },
        })
        
        const { data, error } = response
        
        if (error) {
          // If it's a database error saving user, fall back to mock mode
          if (error.message?.includes('Database error saving new user')) {
            // Continue to mock signup below
          } else {
            throw error
          }
        } else {
          return { data, error: null }
        }
      } catch (signupError) {
        if (signupError.message?.includes('fetch') || !signupError.message) {
          return { 
            data: null, 
            error: { 
              message: 'Unable to connect to the authentication server. Please check your internet connection and try again.',
              originalError: signupError
            } 
          }
        }
        
        return { data: null, error: signupError }
      }
    }
    
    // Fallback to mock mode (development or when Supabase unavailable)
    
    
    // Check if this is an admin signup
    let mockUserData;
    if (email === 'admin@carpolish.com') {
      mockUserData = { 
        id: 'mock-admin-1', 
        email, 
        user_metadata: { 
          full_name: fullName || 'Admin User',
          is_admin: true 
        },
        is_admin: true
      };
    } else {
      mockUserData = { 
        id: 'mock-user-1', 
        email, 
        user_metadata: { 
          full_name: fullName,
          is_admin: false 
        },
        is_admin: false
      };
    }
    
    setMockUser(mockUserData);
    
    return createMockResponse({ 
      user: mockUserData,
      session: { 
        access_token: 'mock-token',
        expires_at: Date.now() + 3600
      }
    })
  } catch (outerError) {
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred during signup. Please try again.',
        originalError: outerError
      } 
    }
  }
}

export const signInWithGoogle = async () => {
  try {
    // For dynamic mode, use real Supabase Google OAuth
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      // Use environment variable for production URL, fallback to current origin for development
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      
      if (error) {
        throw error
      }
      
      return { data, error: null }
    }
    
    // Fallback to mock mode
    const mockUserData = { 
      id: 'mock-google-user-1', 
      email: 'google.user@gmail.com', 
      user_metadata: { 
        full_name: 'Google User',
        is_admin: false,
        provider: 'google'
      },
      is_admin: false
    };
    
    setMockUser(mockUserData);
    
    return createMockResponse({ 
      user: mockUserData,
      session: { 
        access_token: 'mock-google-token',
        expires_at: Date.now() + 3600
      }
    })
  } catch (error) {
    return { 
      data: null, 
      error: { 
        message: 'Google sign-in failed. Please try again.',
        originalError: error
      } 
    }
  }
}

export const signIn = async (email, password) => {
  try {
    // For dynamic mode, always try Supabase first
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      try {
        const response = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        const { data, error } = response
        
        if (error) {
          // Handle email not confirmed - provide user-friendly message
          if (error.message?.includes('Email not confirmed')) {
            return { 
              data: null, 
              error: { 
                message: 'Please check your email and click the confirmation link before signing in. If you didn\'t receive an email, you can disable email confirmation in development.',
                code: 'email_not_confirmed',
                originalError: error
              } 
            }
          }
          
          return { data: null, error }
        } else {
          return { data, error }
        }
      } catch (signinError) {
        if (signinError.message?.includes('fetch') || !signinError.message) {
          return { 
            data: null, 
            error: { 
              message: 'Unable to connect to the authentication server. Please check your internet connection and try again.',
              originalError: signinError
            } 
          }
        }
        
        return { data: null, error: signinError }
      }
    }
    
    // Fallback to mock mode (development or when Supabase unavailable)
    
    // Check if this is the admin login
    let mockUserData;
    if (email === 'admin@carpolish.com') {
      mockUserData = { 
        id: 'mock-admin-1', 
        email, 
        user_metadata: { 
          full_name: 'Admin User',
          is_admin: true 
        },
        is_admin: true
      };
    } else {
      mockUserData = { 
        id: 'mock-user-1', 
        email, 
        user_metadata: { 
          full_name: email.split('@')[0] || 'Mock User',
          is_admin: false 
        },
        is_admin: false
      };
    }
    
    setMockUser(mockUserData);
    
    return createMockResponse({ 
      user: mockUserData,
      session: { 
        access_token: 'mock-token',
        expires_at: Date.now() + 3600
      }
    })
  } catch (outerError) {
    return { 
      data: null, 
      error: { 
        message: 'An unexpected error occurred during sign in. Please try again.',
        originalError: outerError
      } 
    }
  }
}

export const signOut = async () => {
  try {
    // For dynamic mode, use real Supabase
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { error } = await supabase.auth.signOut()
      return { error }
    }
    
    // Fallback to mock mode
    clearMockUser();
    return createMockResponse()
  } catch (error) {
    return { error }
  }
}

// Global variable to track mock authentication state
let mockUser = null;

// Helper to persist mock user to localStorage in browser environment
const persistMockUser = (user) => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('mockUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('mockUser')
    }
  }
  mockUser = user;
};

// Helper to load mock user from localStorage
const loadMockUser = () => {
  if (typeof window !== 'undefined' && !mockUser) {
    try {
      const stored = localStorage.getItem('mockUser')
      if (stored) {
        mockUser = JSON.parse(stored)
        console.log('Loaded mock user from localStorage:', mockUser)
      }
    } catch (error) {
      console.error('Error loading mock user from localStorage:', error)
    }
  }
  return mockUser;
};

// Global variable to store mock cart items in development mode
let mockCartItems = [];

// Helper function to set mock user (called from auth context)
export const setMockUser = (user) => {
  persistMockUser(user);
};

// Helper function to clear mock user (called from signOut)
export const clearMockUser = () => {
  persistMockUser(null);
  // Also clear cart when user logs out
  mockCartItems = [];
};

export const getCurrentUser = async () => {
  try {
    // For dynamic mode, use real Supabase
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
    
    // Fallback to mock mode - load from persistent storage first
    const user = loadMockUser();
    console.log('getCurrentUser returning mock user:', user)
    return user;
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const isUserAdmin = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return false
    
    // For dynamic mode, check user profile in database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data: profile } = await getUserProfile(user.id)
      return profile?.is_admin === true
    }
    
    // Fallback to mock mode
    return user.is_admin === true || user.user_metadata?.is_admin === true
  } catch (error) {
    console.error('Check admin status error:', error)
    return false
  }
}

export const getUserProfile = async (userId) => {
  try {
    // For dynamic mode, get from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    }
    
    // Fallback to mock mode - return profile based on current mock user
    if (mockUser && mockUser.id === userId) {
      const mockProfile = {
        id: userId,
        email: mockUser.email,
        full_name: mockUser.user_metadata?.full_name || 'Mock User',
        is_admin: mockUser.is_admin || mockUser.user_metadata?.is_admin || false
      }
      console.log('Mock getUserProfile returning:', mockProfile)
      return createMockResponse(mockProfile)
    }
    
    // Default fallback if no mock user matches
    return createMockResponse({ 
      id: userId, 
      email: 'user@example.com', 
      full_name: 'Mock User',
      is_admin: false 
    })
  } catch (error) {
    return { data: null, error }
  }
}

// ========== PRODUCT HELPERS ==========
// IMPORTANT: Products are completely static and defined in the mockProducts array.
// These helper functions ONLY use the mockProducts data and DO NOT access the database

export const getProducts = async () => {
  try {
    // Always return mock products without trying to fetch from database
    console.log('Returning static mock products list')
    return createMockResponse(mockProducts)
  } catch (error) {
    console.error('Unexpected error in getProducts:', error)
    return { data: mockProducts, error: null }
  }
}

export const getProduct = async (id) => {
  try {
    // Log the ID being searched for debugging
    console.log('Fetching product with ID:', id)
    
    if (!id) {
      console.warn('Invalid product ID:', id)
      return { data: null, error: { message: 'Product ID is required' } }
    }
    
    // Convert ID to string to ensure consistent comparison
    const searchId = String(id)
    
    // Use ONLY mock data for products, regardless of Supabase configuration
    // Try to find the product by exact ID match first
    let product = mockProducts.find(p => p.id === searchId)
    
    // If not found, try to match with shortId (for URLs like /products/1, /products/2, etc.)
    if (!product) {
      product = mockProducts.find(p => p.shortId === searchId)
    }
    
    // If still not found, try to match with the first few characters of the ID
    if (!product) {
      product = mockProducts.find(p => p.id.includes(searchId))
    }
    
    if (!product) {
      console.warn('Product not found in mock data:', id)
      return { data: null, error: { message: 'Product not found in mock data' } }
    }
    
    // Ensure all required properties are present
    const completeProduct = {
      ...product,
      // Make sure images is an array
      images: product.images || [product.image, product.image, product.image, product.image],
      // Make sure features and specifications exist for the product detail page
      features: product.features || [
        "Professional grade formula",
        "Long-lasting protection",
        "Safe for all surfaces",
        "Easy application",
        "Great value"
      ],
      specifications: product.specifications || {
        "Volume": "16 fl oz (473ml)",
        "Type": "Professional Grade",
        "Application": "Spray & Wipe",
        "Coverage": "Up to 10 vehicles",
        "Drying Time": "5-10 minutes"
      },
      // Ensure stockCount exists (product detail page uses this)
      stockCount: product.stockCount || product.stock || 50
    }
    
    console.log('Found product in static data:', completeProduct.name)
    return createMockResponse(completeProduct)
  } catch (error) {
    console.error('Unexpected error in getProduct:', error)
    return { data: null, error: { message: 'Unexpected error getting product', originalError: error?.message } }
  }
}

// ========== CART HELPERS ==========

export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // For dynamic mode, use real Supabase for cart operations
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      // Get product details from static data
      const product = mockProducts.find(p => p.id === productId || p.shortId === productId)
      if (!product) {
        return { data: null, error: { message: 'Product not found' } }
      }
      
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)
          .select()
          .single()
        return { data, error }
      } else {
        // Add new item
        const { data, error } = await supabase
          .from("cart_items")
          .insert({
            user_id: userId,
            product_id: productId,
            product_name: product.name,
            product_price: product.price,
            product_image: product.image,
            quantity,
          })
          .select()
          .single()
        return { data, error }
      }
    }
    
    // Fallback to mock mode
    console.log('Mock add to cart:', { userId, productId, quantity })
    
    // Get product details from static data
    const product = mockProducts.find(p => p.id === productId || p.shortId === productId)
    if (!product) {
      return { data: null, error: { message: 'Product not found' } }
    }
    
    // Check if item already exists in mock cart
    const existingItemIndex = mockCartItems.findIndex(
      item => item.user_id === userId && item.product_id === productId
    )
    
    let cartItem;
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      mockCartItems[existingItemIndex].quantity += quantity
      cartItem = mockCartItems[existingItemIndex]
    } else {
      // Add new item to mock cart
      cartItem = {
        id: `mock-cart-item-${Date.now()}`,
        user_id: userId,
        product_id: productId,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image,
        quantity: quantity,
        created_at: new Date().toISOString()
      }
      mockCartItems.push(cartItem)
    }
    
    console.log('Mock cart updated, total items:', mockCartItems.length)
    return createMockResponse(cartItem)
  } catch (error) {
    return { data: null, error }
  }
}

export const getCartItems = async (userId) => {
  try {
    // For dynamic mode, get from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
      return { data, error }
    }
    
    // Fallback to mock mode
    console.log('Getting mock cart items for user:', userId)
    // Return cart items for the specific user from mock storage
    const userCartItems = mockCartItems.filter(item => item.user_id === userId)
    console.log('Found mock cart items:', userCartItems.length)
    return createMockResponse(userCartItems)
  } catch (error) {
    return { data: null, error }
  }
}

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    // For dynamic mode, update in real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      if (quantity <= 0) {
        return removeFromCart(cartItemId)
      }

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId)
        .select()
        .single()
      return { data, error }
    }
    
    // Fallback to mock mode
    console.log('Mock update cart quantity:', { cartItemId, quantity })
    
    if (quantity <= 0) {
      return removeFromCart(cartItemId)
    }
    
    // Find and update the item in mock cart
    const itemIndex = mockCartItems.findIndex(item => item.id === cartItemId)
    if (itemIndex >= 0) {
      mockCartItems[itemIndex].quantity = quantity
      return createMockResponse(mockCartItems[itemIndex])
    }
    
    return { data: null, error: { message: 'Cart item not found' } }
  } catch (error) {
    return { data: null, error }
  }
}

export const removeFromCart = async (cartItemId) => {
  try {
    // For dynamic mode, remove from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId)
      return { error }
    }
    
    // Fallback to mock mode
    console.log('Mock remove from cart:', { cartItemId })
    
    // Find and remove the item from mock cart
    const itemIndex = mockCartItems.findIndex(item => item.id === cartItemId)
    if (itemIndex >= 0) {
      mockCartItems.splice(itemIndex, 1)
      console.log('Removed item from mock cart, remaining items:', mockCartItems.length)
    }
    
    return createMockResponse()
  } catch (error) {
    return { error }
  }
}

export const clearCart = async (userId) => {
  try {
    // For dynamic mode, clear from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
      return { error }
    }
    
    // Fallback to mock mode
    console.log('Mock clear cart:', { userId })
    
    // Remove all items for the specific user from mock cart
    mockCartItems = mockCartItems.filter(item => item.user_id !== userId)
    console.log('Cleared cart for user, remaining items:', mockCartItems.length)
    
    return createMockResponse()
  } catch (error) {
    return { error }
  }
}

export const getCartTotal = async (userId) => {
  try {
    // For dynamic mode, get from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data, error } = await supabase
        .rpc('get_cart_total', { user_id: userId })
      
      return { data, error }
    }
    
    // Fallback to mock mode
    // Calculate total from mock cart items
    const userCartItems = mockCartItems.filter(item => item.user_id === userId)
    const total = userCartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0)
    const count = userCartItems.reduce((sum, item) => sum + item.quantity, 0)
    
    console.log('Mock cart total:', { total, count })
    return createMockResponse({ total, count })
  } catch (error) {
    return { data: null, error }
  }
}

// ========== ORDER HELPERS ==========

export const createOrder = async (orderDataOrUserId, cartItems = null, shippingAddress = null, totalAmount = null) => {
  try {
    // Support both new format (single object) and legacy format (separate parameters)
    let orderData;
    if (typeof orderDataOrUserId === 'object' && orderDataOrUserId !== null) {
      // New format: single orderData object
      orderData = orderDataOrUserId;
    } else {
      // Legacy format: separate parameters
      orderData = {
        user_id: orderDataOrUserId,
        customer_name: 'Customer',
        customer_email: 'customer@email.com',
        customer_phone: '',
        delivery_address: shippingAddress,
        items: cartItems,
        total_amount: totalAmount,
        payment_method: 'cod',
        status: 'pending'
      };
    }

    // For dynamic mode, create order in real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      // Create order record
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: orderData.user_id,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          delivery_address: orderData.delivery_address,
          subtotal: orderData.subtotal,
          delivery_charge: orderData.delivery_charge,
          total_amount: orderData.total_amount,
          payment_method: orderData.payment_method || 'cod',
          status: orderData.status || 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          price: item.total_price || (item.product_price * item.quantity), // Map to existing 'price' column
          total_price: item.total_price || (item.product_price * item.quantity), // Also set total_price if it exists
        }))

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems)

        if (itemsError) throw itemsError
      }

      // Clear cart if user_id is provided
      if (orderData.user_id) {
        await clearCart(orderData.user_id)
      }

      return { data: order, error: null }
    }
    
    // Fallback to mock mode
    console.log('Mock create order:', orderData)
    const mockOrder = {
      id: `mock-order-${Date.now()}`,
      ...orderData,
      created_at: new Date().toISOString()
    }
    
    // Clear mock cart if user_id is provided
    if (orderData.user_id) {
      await clearCart(orderData.user_id)
    }
    
    return createMockResponse(mockOrder)
  } catch (error) {
    console.error('Error creating order:', error)
    return { data: null, error }
  }
}

export const getOrders = async (userId = null) => {
  try {
    // For dynamic mode, get from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      let query = supabase
        .from("orders")
        .select(`
          *,
          order_items(*)
        `)
        .order("created_at", { ascending: false })

      if (userId) {
        query = query.eq("user_id", userId)
      }

      const { data, error } = await query
      
      if (error) {
        console.warn('Database error getting orders:', error)
        return { data: null, error }
      }
      
      // Transform data to include customer info from the order data itself
      const transformedData = data?.map(order => ({
        ...order,
        // Use customer info from the order record (already stored during checkout)
        customer_name: order.customer_name || 'Customer',
        customer_email: order.customer_email || 'customer@email.com',
        items: order.order_items || []
      })) || []
      
      return { data: transformedData, error: null }
    }
    
    // Fallback to mock mode
    return createMockResponse([])
  } catch (error) {
    console.warn('Error in getOrders:', error)
    return { data: null, error }
  }
}

export const getOrder = async (orderId) => {
  try {
    // For dynamic mode, get from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          users(email, full_name),
          order_items(*)
        `)
        .eq("id", orderId)
        .single()
      return { data, error }
    }
    
    // Fallback to mock mode
    return createMockResponse(null)
  } catch (error) {
    return { data: null, error }
  }
}

export const updateOrderStatus = async (orderId, status) => {
  try {
    // For dynamic mode, update in real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single()
      return { data, error }
    }
    
    // Fallback to mock mode
    console.log('Mock update order status:', { orderId, status })
    return createMockResponse({ id: orderId, status })
  } catch (error) {
    return { data: null, error }
  }
}

// ========== ADMIN HELPERS ==========

export const getUsers = async () => {
  try {
    // For dynamic mode, get from real database
    if (isSupabaseConfigured && !FORCE_DEV_MODE) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
      return { data, error }
    }
    
    // Fallback to mock mode
    return createMockResponse([
      { id: 'mock-user-1', email: 'user@example.com', full_name: 'Mock User', created_at: new Date().toISOString() }
    ])
  } catch (error) {
    return { data: null, error }
  }
}

export const getAnalytics = async () => {
  try {
    if (FORCE_DEV_MODE) {
      return createMockResponse({
        totalUsers: 1,
        totalProducts: mockProducts.length,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: []
      })
    }
    
    // Get analytics data
    const [usersResult, ordersResult] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("orders").select("total_amount, created_at").order("created_at", { ascending: false })
    ])

    const totalUsers = usersResult.count || 0
    const totalProducts = mockProducts.length // Static products count
    const orders = ordersResult.data || []
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const recentOrders = orders.slice(0, 5)

    return createMockResponse({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders
    })
  } catch (error) {
    return { data: null, error }
  }
}

// ========== ADMIN PRODUCT MANAGEMENT HELPERS ==========

export const createProduct = async (productData) => {
  try {
    if (FORCE_DEV_MODE) {
      console.log('Mock create product:', productData)
      // In development mode, we'll just simulate creating a product
      // but won't actually modify the static mockProducts array
      const newProduct = {
        id: `mock-product-${Date.now()}`,
        ...productData,
        created_at: new Date().toISOString()
      }
      return createMockResponse(newProduct)
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateProduct = async (productId, productData) => {
  try {
    if (FORCE_DEV_MODE) {
      console.log('Mock update product:', { productId, productData })
      // In development mode, simulate updating a product
      const updatedProduct = {
        id: productId,
        ...productData,
        updated_at: new Date().toISOString()
      }
      return createMockResponse(updatedProduct)
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const deleteProduct = async (productId) => {
  try {
    if (FORCE_DEV_MODE) {
      console.log('Mock delete product:', productId)
      // In development mode, simulate deleting a product
      return createMockResponse({ id: productId, deleted: true })
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    return { error }
  } catch (error) {
    return { error }
  }
}

export const uploadProductImage = async (file, productId) => {
  try {
    if (FORCE_DEV_MODE) {
      console.log('Mock upload product image:', { fileName: file?.name, productId })
      // In development mode, simulate image upload
      // Return a mock URL
      const mockImageUrl = `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(file?.name || 'mock-image')}`
      return createMockResponse({ 
        url: mockImageUrl,
        path: `products/${productId}/${file?.name || 'mock-image.jpg'}`
      })
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
    
    return { data: { url: urlData.publicUrl, path: filePath }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
