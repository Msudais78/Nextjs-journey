// ==============================================================================
// NEXT.JS MIDDLEWARE — SECURITY & PASS-THROUGH INTERCEPTOR
// ==============================================================================
// This file acts as an edge/server-level gatekeeper. Next.js automatically runs
// this middleware on incoming requests matching the defined route patterns BEFORE
// they reach API route handlers or page components.
// ==============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for verifying JWT signatures, securely stored in environment variables.
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Public Routes
 * These routes do not require authentication. If an authenticated user
 * attempts to access these routes, they will be redirected to the dashboard.
 * Note: '/' is handled exactly, while others are checked using startsWith().
 */
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-otp',
  '/',
  '/auth'
];

/**
 * Protected Routes
 * These routes strictly require a valid authentication token. 
 * If a user attempts to access these without a token, they are redirected to /auth.
 */
const protectedRoutes = [
  '/dashboard'
];

/**
 * Main Middleware Function
 * Intercepts requests to verify authentication state and handle route protection.
 * 
 * @param request - NextRequest context object containing URL, headers, and cookies
 * @returns NextResponse (either a redirect or pass-through to the requested route)
 */
export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session_token')?.value;

  // Check if the requested path falls under protected or public categories
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // For the root path ('/'), require an exact match to prevent it from matching EVERY route.
  // For all other public routes, a startsWith() check is sufficient.
  const isPublicRoute = publicRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

  // 1. Unauthenticated user trying to access a protected route
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 2. User has a session token (could be valid or expired/invalid)
  if (sessionToken) {
    try {
      // Attempt to verify the token signature and expiration
      const secret = new TextEncoder().encode(JWT_SECRET || '');
      await jwtVerify(sessionToken, secret);
      
      // If the token is VALID and the user is trying to access a public route
      // (like the login page or landing page), redirect them to the dashboard.
      if (isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
    } catch (error) {
      // If the token is INVALID (tampered with or expired)
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/auth', request.url));
        // Clear the invalid token so it doesn't keep getting sent
        response.cookies.delete('session_token');
        return response;
      }
      // If they are on a public/unprotected route with an invalid token, 
      // just ignore the token and let them proceed.
      return NextResponse.next();
    }
  }
  
  // 3. Allow request to proceed normally if no redirect conditions were met
  return NextResponse.next();
} 

/**
 * Route Matcher Configuration
 * Defines paths intercepted by this middleware.
 * Excludes API routes, static Next.js files, and image optimization endpoints
 * to prevent unnecessary middleware execution overhead.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};
