// ==============================================================================
// NEXT.JS PROXY — SECURITY & PASS-THROUGH INTERCEPTOR
// ==============================================================================
// This file acts as an edge/server-level gatekeeper. Next.js automatically runs
// this proxy on incoming requests matching the defined route patterns BEFORE
// they reach API route handlers.
// ==============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Proxy Handler
 * 
 * @param request - NextRequest context object containing URL, headers, and metadata
 * @returns NextResponse pass-through
 */
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

/**
 * Route Matcher Configuration
 * Defines paths intercepted by this proxy.
 */
export const config = {
  matcher: ['/api/auth/:path*'],
};
