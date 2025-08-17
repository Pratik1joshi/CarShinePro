import { NextResponse } from 'next/server'

export async function middleware(req) {
  // Temporarily disable middleware to test client-side auth handling
  // The AdminAuthWrapper component will handle all authentication
  console.log('Middleware: Allowing all requests, client-side auth will handle protection')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ],
}
