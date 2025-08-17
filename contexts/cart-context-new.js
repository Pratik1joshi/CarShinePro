"use client"

import { createContext, useContext, useReducer, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'
import { 
  addToCart as addToCartDB, 
  getCartItems, 
  updateCartItemQuantity, 
  removeFromCart as removeFromCartDB,
  clearCart as clearCartDB,
  getCurrentUser 
} from '@/lib/supabase'

// Cart context
const CartContext = createContext()

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        loading: false
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.product_id === action.payload.product_id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product_id === action.payload.product_id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.cartItemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    
    default:
      return state
  }
}

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null
}

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Load cart when user authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // User is logged in, load their cart
      loadCart()
    } else {
      // User is not logged in, clear cart
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [isAuthenticated, user?.id]) // Watch for authentication state changes

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        dispatch({ type: 'SET_CART', payload: [] })
        return
      }
      
      const { data: cartItems, error } = await getCartItems(user.id)
      if (error) throw error
      dispatch({ type: 'SET_CART', payload: cartItems || [] })
    } catch (error) {
      console.error('Load cart error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      dispatch({ type: 'SET_CART', payload: [] }) // Clear cart on error
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Check authentication using context
      if (!isAuthenticated || !user) {
        // Redirect to login page instead of showing error
        router.push('/login')
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: false, error: 'Redirecting to login...' }
      }

      const { data, error } = await addToCartDB(user.id, productId, quantity)
      if (error) throw error

      // Reload cart to get updated data with product details
      await loadCart()
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Add to cart error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const { data, error } = await updateCartItemQuantity(cartItemId, quantity)
      if (error) throw error

      if (quantity <= 0) {
        dispatch({ type: 'REMOVE_ITEM', payload: cartItemId })
      } else {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } })
      }
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Update quantity error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const removeFromCart = async (cartItemId) => {
    try {
      const { data, error } = await removeFromCartDB(cartItemId)
      if (error) throw error

      dispatch({ type: 'REMOVE_ITEM', payload: cartItemId })
      return { success: true, error: null }
    } catch (error) {
      console.error('Remove from cart error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const clearCart = async () => {
    try {
      // Check authentication using context
      if (!isAuthenticated || !user) {
        dispatch({ type: 'CLEAR_CART' })
        return { success: false, error: 'User not found' }
      }

      const { data, error } = await clearCartDB(user.id)
      if (error) throw error

      dispatch({ type: 'CLEAR_CART' })
      return { success: true, error: null }
    } catch (error) {
      console.error('Clear cart error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Calculate cart totals
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      return total + (item.product_price || 0) * item.quantity
    }, 0)
  }

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    // State
    items: state.items,
    loading: state.loading,
    error: state.error,
    
    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart,
    getCartTotal,
    
    // Computed values
    cartTotal: getCartTotal(),
    itemCount: getCartItemCount(),
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
