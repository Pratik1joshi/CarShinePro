// Input validation utilities
import { z } from 'zod'

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customer_email: z.string().email('Invalid email format'),
  customer_phone: z.string().regex(/^(98|97)\d{8}$/, 'Invalid Nepali phone number'),
  delivery_address: z.object({
    tole: z.string().min(2, 'Tole is required'),
    ward: z.number().min(1).max(35, 'Ward must be between 1-35'),
    municipality: z.string().min(2, 'Municipality is required'),
    district: z.string().min(2, 'District is required'),
    province: z.string().min(2, 'Province is required'),
    landmark: z.string().optional()
  }),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string(),
    quantity: z.number().min(1).max(10),
    price: z.number().positive()
  })).min(1, 'At least one item required'),
  total_amount: z.number().positive(),
  payment_method: z.literal('cod')
})

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  category: z.enum(['shiner', 'coating', 'cleaner', 'combo']),
  image: z.string().url().optional(),
  is_active: z.boolean().default(true)
})

// Sanitize HTML to prevent XSS
export function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="/gi, 'data-')
}

// Rate limiting (simple in-memory store - use Redis for production)
const requestCounts = new Map()

export function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const requests = requestCounts.get(identifier) || []
  
  // Clean old requests
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs)
  
  if (validRequests.length >= maxRequests) {
    return false
  }
  
  validRequests.push(now)
  requestCounts.set(identifier, validRequests)
  return true
}
