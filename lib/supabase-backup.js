import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase credentials are provided
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.warn('⚠️  Supabase credentials not configured. Please update your .env.local file with valid Supabase credentials.')
}

export const supabase = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Helper function to check if Supabase is available
const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please check your environment variables.')
  }
}

// ========== AUTH HELPERS ==========

export const signUp = async (email, password, fullName) => {
  try {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured. Please check your environment variables.') }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    
    if (error) throw error
    
    // Create user profile in users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
        })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const signIn = async (email, password) => {
  try {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured. Please check your environment variables.') }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    if (!supabase) {
      return { error: new Error('Supabase not configured. Please check your environment variables.') }
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    if (!supabase) {
      return null
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// ========== PRODUCT HELPERS ==========

export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getProduct = async (id) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getProductsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const searchProducts = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// ========== CART HELPERS ==========

export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (existingItem) {
      // Update quantity if item exists
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
      return { data, error }
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity,
        })
        .select()
      return { data, error }
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const getCartItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity <= 0) {
      return removeFromCart(cartItemId)
    }
    
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const removeFromCart = async (cartItemId) => {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const clearCart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getCartTotal = async (userId) => {
  try {
    const { data: cartItems, error } = await getCartItems(userId)
    if (error) return { total: 0, error }
    
    const total = cartItems?.reduce((sum, item) => {
      return sum + (item.products.price * item.quantity)
    }, 0) || 0
    
    return { total, error: null }
  } catch (error) {
    return { total: 0, error }
  }
}

// ========== ORDER HELPERS ==========

export const createOrder = async (userId, cartItems, shippingAddress, totalAmount) => {
  try {
    // Start a transaction by creating the order first
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price
    }))

    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select()

    if (orderItemsError) throw orderItemsError

    // Clear the cart after successful order creation
    await clearCart(userId)

    return { data: { order, orderItems: orderItemsData }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getOrders = async (userId = null) => {
  try {
    let query = supabase
      .from("orders")
      .select(`
        *,
        users(full_name, email),
        order_items(*, products(name, price, image_url))
      `)
      .order("created_at", { ascending: false })

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data, error } = await query
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getOrder = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        users(full_name, email),
        order_items(*, products(name, price, image_url))
      `)
      .eq("id", orderId)
      .single()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// ========== USER MANAGEMENT HELPERS ==========

export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// ========== ADMIN HELPERS ==========

export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const deleteProduct = async (productId) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// ========== ANALYTICS HELPERS ==========

export const getOrderStats = async () => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, status, created_at")

    if (error) throw error

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
    }

    return { data: stats, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getTopProducts = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from("order_items")
      .select(`
        product_id,
        quantity,
        products(name, price, image_url)
      `)

    if (error) throw error

    // Group by product and sum quantities
    const productStats = data.reduce((acc, item) => {
      const productId = item.product_id
      if (!acc[productId]) {
        acc[productId] = {
          product: item.products,
          totalSold: 0
        }
      }
      acc[productId].totalSold += item.quantity
      return acc
    }, {})

    // Sort by total sold and limit
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit)

    return { data: topProducts, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
