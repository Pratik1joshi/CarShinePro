"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signUp as signUpSupabase, 
  signIn as signInSupabase, 
  signOut as signOutSupabase,
  signInWithGoogle as signInWithGoogleSupabase,
  getCurrentUser,
  getUserProfile,
  clearMockUser
} from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    getSession()

    try {
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          // Get user profile
          const { data: profileData } = await getUserProfile(session.user.id)
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      })

      return () => {
        if (subscription?.unsubscribe) {
          subscription.unsubscribe()
        }
      }
    } catch (error) {
      console.error('Error setting up auth listener:', error)
      setLoading(false)
    }
  }, [])

  const getSession = async () => {
    try {
      console.log('Auth Context: Getting current session...')
      const user = await getCurrentUser()
      if (user) {
        console.log('Auth Context: Found user:', { id: user.id, email: user.email, isAdmin: user.is_admin })
        setUser(user)
        const { data: profileData } = await getUserProfile(user.id)
        console.log('Auth Context: Profile data:', profileData)
        setProfile(profileData)
      } else {
        console.log('Auth Context: No user found')
      }
    } catch (error) {
      console.error('Get session error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await signUpSupabase(email, password, fullName)
      
      if (error) {
        // Extract the most user-friendly error message without console logs
        let errorMessage = 'Failed to create account. Please try again.'
        
        if (error.message) {
          if (error.message.includes('Unable to connect')) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.'
          } else if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please try signing in.'
          } else if (error.message.includes('weak password')) {
            errorMessage = 'Please use a stronger password (at least 6 characters).'
          } else if (error.message.includes('invalid email')) {
            errorMessage = 'Please enter a valid email address.'
          } else if (error.message.includes('Password should be')) {
            errorMessage = 'Password must be at least 6 characters long.'
          }
        }
        
        setError(errorMessage)
        return { success: false, data: null, error: errorMessage }
      }
      
      // Check if we're using mock data and return appropriate success message
      if (data?.user?.id === 'mock-user-1') {
        // Set the user state for mock authentication
        setUser(data.user)
        setProfile({ id: data.user.id, email: data.user.email, full_name: data.user.user_metadata?.full_name })
        // Return a special message for development mode
        return { success: 'Development Mode: Account created successfully!', data, error: null }
      } else {
        return { success: true, data, error: null }
      }
    } catch (error) {
      const errorMessage = 'Something went wrong. Please try again.'
      setError(errorMessage)
      return { success: false, data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await signInSupabase(email, password)
      
      if (error) {
        // Extract the most user-friendly error message without logging
        let errorMessage = 'Invalid email or password. Please try again.'
        
        if (error.message) {
          if (error.message.includes('Unable to connect')) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.'
          } else if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
            errorMessage = 'Invalid email or password. Please try again.'
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please check your email and confirm your account first.'
          } else if (error.message.includes('too many requests')) {
            errorMessage = 'Too many login attempts. Please wait a moment and try again.'
          }
        }
        
        setError(errorMessage)
        return { success: false, data: null, error: errorMessage }
      }
      
      // Check if we're using mock data and set user state
      if (data?.user?.id?.startsWith('mock-')) {
        console.log('Auth Context: Mock user login detected:', data.user)
        // Set the user state for mock authentication
        setUser(data.user)
        
        // Get the full profile data with admin status
        const { data: profileData } = await getUserProfile(data.user.id)
        console.log('Auth Context: Mock profile loaded:', profileData)
        setProfile(profileData)
      }
      
      return { success: true, data, error: null }
    } catch (error) {
      const errorMessage = 'Something went wrong. Please try again.'
      setError(errorMessage)
      return { success: false, data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await signOutSupabase()
      
      if (error) throw error
      
      // Clear mock user and local state
      clearMockUser()
      setUser(null)
      setProfile(null)
      
      return { success: true, error: null }
    } catch (error) {
      setError('Failed to sign out. Please try again.')
      return { success: false, error: 'Failed to sign out. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await signInWithGoogleSupabase()
      
      if (error) {
        let errorMessage = 'Google sign-in failed. Please try again.'
        
        if (error.message) {
          if (error.message.includes('Unable to connect')) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.'
          } else if (error.message.includes('popup')) {
            errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.'
          } else if (error.message.includes('cancelled')) {
            errorMessage = 'Sign-in was cancelled.'
          }
        }
        
        setError(errorMessage)
        return { success: false, data: null, error: errorMessage }
      }
      
      return { success: true, data, error: null }
    } catch (error) {
      const errorMessage = 'Something went wrong with Google sign-in. Please try again.'
      setError(errorMessage)
      return { success: false, data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    clearError,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
