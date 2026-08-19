// ==============================================================================
// NEXT.JS PROXY — SECURITY & PASS-THROUGH INTERCEPTOR
// ==============================================================================
// This file acts as an edge/server-level gatekeeper. Next.js automatically runs
// this proxy on incoming requests matching the defined route patterns BEFORE
// they reach API route handlers.
// ==============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-otp',
  '/'
];

const protectedRoutes = [
  '/dashboard'
];

export const middleware = async (request: NextRequest) => {
  const {pathname} = request.nextUrl;
  const sessionToken = request.cookies.get('session_token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionToken){
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (sessionToken){
    try{
      const secret = new TextEncoder().encode(JWT_SECRET || '');
      await jwtVerify(sessionToken, secret)
      
      if (isPublicRoute){
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
    } catch(error){
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/auth', request.url))

        response.cookies.delete('session_token')

        return response
      }
      return NextResponse.next();
    }
  }
  return NextResponse.next();
} 

/**
 * Next.js Proxy Handler (Removed unused proxy function)
 */

/**
 * Route Matcher Configuration
 * Defines paths intercepted by this proxy.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};
