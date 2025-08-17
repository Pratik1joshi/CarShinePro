# Error Handling Documentation

This document outlines the error handling strategy implemented in the CarPolish Pro application.

## Authentication Error Handling

### Sign Up Function

The sign-up function (`signUp`) in `lib/supabase.js` has been enhanced with comprehensive error handling:

```javascript
export const signUp = async (email, password, fullName) => {
  try {
    if (!supabase) {
      console.log('Mock signup (no Supabase connection):', { email, fullName })
      // Mock signup response for development without Supabase
      return createMockResponse({ user: { id: 'mock-user-1', email, user_metadata: { full_name: fullName } } })
    }
    
    console.log('Attempting to sign up with Supabase:', { email, fullName })
    
    try {
      // Use a try/catch specifically for the signUp call to handle network errors
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      
      if (error) {
        console.error('Supabase signup error:', error)
      } else {
        console.log('Signup successful for user:', data?.user?.id)
      }
      
      return { data, error }
    } catch (signupError) {
      console.error('Failed during supabase.auth.signUp:', signupError)
      
      // Check if this is a network error and provide a more user-friendly message
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
  } catch (outerError) {
    console.error('Unexpected error in signUp function:', outerError)
    return { 
      data: null, 
      error: { 
        message: outerError.message || 'An unexpected error occurred during sign up',
        originalError: outerError
      } 
    }
  }
}
```

### Sign In Function

The sign-in function (`signIn`) in `lib/supabase.js` uses a similar pattern:

```javascript
export const signIn = async (email, password) => {
  try {
    if (!supabase) {
      console.log('Mock signin (no Supabase connection):', { email })
      // Return a successful mock response for development without Supabase
      return createMockResponse({ 
        user: { 
          id: 'mock-user-1', 
          email, 
          user_metadata: { full_name: 'Mock User' } 
        },
        session: { 
          access_token: 'mock-token',
          expires_at: Date.now() + 3600
        }
      })
    }
    
    console.log('Attempting to sign in with Supabase:', { email })
    
    try {
      // Use a try/catch specifically for the signIn call to handle network errors
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const { data, error } = response
      
      if (error) {
        console.error('Supabase signin error:', error)
      } else {
        console.log('Signin successful for user:', data?.user?.id)
      }
      
      return { data, error }
    } catch (signinError) {
      console.error('Failed during supabase.auth.signInWithPassword:', signinError)
      
      // Check if this is a network error and provide a more user-friendly message
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
  } catch (outerError) {
    console.error('Unexpected error in signIn function:', outerError)
    return { 
      data: null, 
      error: { 
        message: outerError.message || 'An unexpected error occurred during sign in',
        originalError: outerError
      } 
    }
  }
}
```

## Context Error Handling

### Auth Context

The Auth Context has been enhanced to provide better error messages for common authentication issues:

```javascript
// In contexts/auth-context.js
const signIn = async (email, password) => {
  try {
    setLoading(true)
    setError(null)
    
    const { data, error } = await signInSupabase(email, password)
    
    if (error) {
      console.error('Auth context signIn error:', error)
      
      // Extract the most user-friendly error message
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.'
      
      if (error.message) {
        if (error.message.includes('Unable to connect')) {
          errorMessage = error.message // Use the network error message directly
        } else if (error.message.includes('Invalid login')) {
          errorMessage = 'Invalid email or password'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account first'
        }
      }
      
      setError(errorMessage)
      return { success: false, data: null, error: errorMessage }
    }
    
    return { success: true, data, error: null }
  } catch (error) {
    const errorMessage = error.message || 'An unexpected error occurred'
    console.error('Auth context unexpected signin error:', error)
    setError(errorMessage)
    return { success: false, data: null, error: errorMessage }
  } finally {
    setLoading(false)
  }
}
```

Similarly for sign up:

```javascript
// In contexts/auth-context.js
const signUp = async (email, password, fullName) => {
  try {
    setLoading(true)
    setError(null)
    
    console.log('Auth context: Starting signup process for:', email)
    
    const { data, error } = await signUpSupabase(email, password, fullName)
    
    if (error) {
      console.error('Auth context signUp error:', error)
      
      // Extract the most user-friendly error message
      let errorMessage = 'Failed to create account. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Unable to connect')) {
          errorMessage = error.message // Use the network error message directly
        } else if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try signing in.'
        } else if (error.message.includes('weak password')) {
          errorMessage = 'Please use a stronger password (at least 6 characters)'
        } else if (error.message.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address'
        } else if (error.message) {
          // Use the original message if it exists and isn't covered above
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      return { success: false, data: null, error: errorMessage }
    }
    
    console.log('Auth context: Signup successful for:', email)
    return { success: true, data, error: null }
  } catch (error) {
    const errorMessage = error.message || 'An unexpected error occurred'
    console.error('Auth context unexpected signup error:', error)
    setError(errorMessage)
    return { success: false, data: null, error: errorMessage }
  } finally {
    setLoading(false)
  }
}
```

## UI Components

### Login and Signup Forms

Both login and signup forms have been updated to display user-friendly error messages:

```jsx
{/* Error Message */}
{error && (
  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
    <AlertCircle className="w-4 h-4" />
    <span className="text-sm">{error}</span>
  </div>
)}

{/* Success Message (for signup) */}
{success && (
  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
    <CheckCircle className="w-4 h-4" />
    <span className="text-sm">{success}</span>
  </div>
)}
```

## Error Handling Strategy

1. **Layered Approach**: We use a multi-level error handling strategy:
   - API level (in Supabase functions)
   - Context level (in auth and cart contexts)
   - Component level (in UI components)

2. **User-Friendly Messages**: Technical error details are logged to the console, while user-facing messages are simplified and actionable.

3. **Network Error Detection**: Special handling for network connectivity issues with clear instructions.

4. **Comprehensive Logging**: Errors are logged at each level for debugging.

5. **Validation Feedback**: Form validation with immediate feedback for user inputs.

## Common Error Types Handled

1. **Authentication Errors**:
   - Invalid credentials
   - Already registered email
   - Weak password
   - Network connectivity issues
   
2. **Form Validation Errors**:
   - Password mismatch
   - Invalid email format
   - Missing required fields
   
3. **API Errors**:
   - Failed fetch requests
   - Timeout errors
   - Server errors

## Development Mode

The application includes a development mode feature to help with situations where Supabase is unavailable or experiencing issues. This mode enables development to continue without requiring a functioning Supabase backend.

```javascript
// In lib/supabase.js
// DEVELOPMENT MODE TOGGLE - Set to true to force using mock data
const FORCE_DEV_MODE = true;
```

When development mode is enabled:
- All database operations use mock data instead of connecting to Supabase
- Authentication works with any email/password combination
- Mock user accounts are created instantly without email verification
- The UI indicates you're in development mode with special messages
- Console logs provide clear indications of mock operations

To disable development mode and use a real Supabase backend:
1. Set `FORCE_DEV_MODE = false` in `lib/supabase.js`
2. Configure your Supabase credentials in `.env.local`
3. Run the database setup script: `node setup-database.mjs`

## Testing Error Handling

To verify the error handling is working:

1. **Network Errors**: Disconnect from the internet and try to log in/sign up.
2. **Invalid Credentials**: Try logging in with incorrect password.
3. **Duplicate Account**: Try to register with an existing email.
4. **Password Validation**: Try to register with a weak password.

## Future Improvements

1. **Retry Logic**: Implement automatic retry for transient errors.
2. **Offline Mode**: Enhanced offline capabilities with better error recovery.
3. **Error Monitoring**: Integration with error tracking services like Sentry.
