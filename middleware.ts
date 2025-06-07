import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/signin',
    '/signup', 
    '/pricing',
    '/api/auth/register',
    '/api/auth/signin',
    '/api/auth/callback',
    '/api/auth/signout',
    '/api/auth/session',
    '/api/auth/providers'
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Protected routes that require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/sources') ||
                          pathname.startsWith('/ingest') ||
                          pathname.startsWith('/mapping') ||
                          pathname.startsWith('/kpi-check') ||
                          pathname.startsWith('/records') ||
                          pathname.startsWith('/audit') ||
                          pathname.startsWith('/reports') ||
                          pathname.startsWith('/benchmarks') ||
                          pathname.startsWith('/admin')

  // Handle authentication logic
  if (isProtectedRoute) {
    if (!session?.user) {
      // 401: Redirect to login if not authenticated
      const callbackUrl = encodeURIComponent(pathname)
      return NextResponse.redirect(
        new URL(`/signin?callbackUrl=${callbackUrl}`, request.url)
      )
    }
    // Role-based access control removed - all authenticated users can access all routes
  }

  // If user is logged in and tries to access public auth pages, redirect to dashboard
  if (session?.user && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api(?!/auth)|_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 