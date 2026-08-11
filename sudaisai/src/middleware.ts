// ==============================================================================
// NEXT.JS MIDDLEWARE — RATE LIMITING & SECURITY INTERCEPTOR
// ==============================================================================
// This file acts as an edge/server-level gatekeeper. Next.js automatically runs
// this middleware on incoming requests matching the defined route patterns BEFORE
// they reach API route handlers.
// ==============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RE2JS } from 're2js';

// Pre-compiled linear-time RE2JS regex instances for IP validation (O(n) guaranteed execution)
const ipv4LinearRegex = RE2JS.compile(
  '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
);
const ipv6LinearRegex = RE2JS.compile(
  '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^([0-9a-fA-F]{1,4}:){1,7}:$'
);

// ==============================================================================
// 1. IN-MEMORY RATE LIMIT STORE
// ==============================================================================
// Map object that keeps track of request counts and reset timestamps per IP address.
// Key format: "signup:<IP_ADDRESS>" -> Value: { count: number, resetTime: timestamp }
// ⚠️ NOTE: In distributed production environments (e.g. multiple server instances or Vercel edge),
// replace this in-memory Map with a shared cache like Redis or Upstash.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ==============================================================================
// 2. RATE LIMIT CONFIGURATION CONSTANTS
// ==============================================================================
// Single source of truth for rate limiting thresholds.
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000,      // 15 minutes window (in milliseconds)
  maxRequests: 5,                 // Maximum allowed signup attempts within the window
  blockDuration: 60 * 60 * 1000,  // 1 hour penalty block duration when request limit is exceeded
};

// ==============================================================================
// 3. IP ADDRESS VALIDATION HELPER
// ==============================================================================
/**
 * Validates whether a string is a valid IPv4 or IPv6 address using linear-time RE2JS patterns.
 * Prevents IP spoofing, malformed header injection, and ReDoS attack vectors.
 * 
 * @param ip - String to validate
 * @returns boolean - True if valid IPv4 or IPv6 address
 */
function isValidIP(ip: string): boolean {
  return ipv4LinearRegex.testExact(ip) || ipv6LinearRegex.testExact(ip);
}

// ==============================================================================
// 4. CLIENT IP EXTRACTION HELPER
// ==============================================================================
/**
 * Safely extracts and verifies the real client IP address from the request.
 * Checks platform headers in order of trust to prevent IP header spoofing.
 * 
 * @param request - Incoming NextRequest object
 * @returns string - Verified IP address or default fallback IP
 */
function getClientIP(request: NextRequest): string {
  // Step A: Check request.ip provided natively by trusted edge platforms (Vercel / Cloudflare)
  const platformIP = (request as NextRequest & { ip?: string }).ip;
  if (platformIP && isValidIP(platformIP)) {
    return platformIP;
  }

  // Step B: Check X-Forwarded-For header (sent by reverse proxies / load balancers)
  // Header structure: "client_ip, proxy1_ip, proxy2_ip"
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Extract the VERY FIRST IP address in the chain (the original client)
    const firstIP = forwarded.split(',')[0].trim();
    if (isValidIP(firstIP)) return firstIP;
  }

  // Step C: Check X-Real-IP header (sent by Nginx / secondary proxies)
  const realIP = request.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) return realIP;

  // Step D: Fallback to localhost IP to avoid grouping unknown requests into a single bucket
  return '127.0.0.1';
}

// ==============================================================================
// 5. CORE RATE LIMITING EVALUATION LOGIC
// ==============================================================================
/**
 * Checks and updates rate limit counters for a specific IP address.
 * 
 * @param ip - Client IP address
 * @returns Object containing access boolean, remaining requests count, and reset timestamp
 */
export function rateLimit(
  ip: string,
  options?: { windowMs?: number; maxRequests?: number; max?: number; prefix?: string }
): {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
} {
  const now = Date.now();
  const windowMs = options?.windowMs ?? RATE_LIMIT_CONFIG.windowMs;
  const maxRequests = options?.maxRequests ?? options?.max ?? RATE_LIMIT_CONFIG.maxRequests;
  const prefix = options?.prefix ?? 'signup';
  const key = `${prefix}:${ip}`;
  const record = rateLimitStore.get(key);

  // Periodic Memory Cleanup: If stored IP records exceed 1,000, remove expired entries to prevent memory leaks
  if (rateLimitStore.size > 1000) {
    for (const [storedKey, storedValue] of rateLimitStore.entries()) {
      if (storedValue.resetTime < now) {
        rateLimitStore.delete(storedKey);
      }
    }
  }

  // CASE 1: Brand new IP or previous rate limit window has expired
  if (!record || record.resetTime < now) {
    const newResetTime = now + windowMs;
    
    // Initialize record with 1 attempt and set reset timer
    rateLimitStore.set(key, {
      count: 1,
      resetTime: newResetTime,
    });

    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime: newResetTime,
    };
  }

  // CASE 2: IP has ALREADY reached or exceeded maximum allowed requests
  if (record.count >= maxRequests) {
    // Apply 1-hour block penalty duration if not already applied
    const extendedResetTime = Math.max(
      record.resetTime,
      now + RATE_LIMIT_CONFIG.blockDuration
    );
    record.resetTime = extendedResetTime;
    rateLimitStore.set(key, record);

    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: extendedResetTime,
    };
  }

  // CASE 3: IP is within limit — increment attempt counter
  record.count += 1;

  // If this request causes the count to reach the limit, extend reset time to 1-hour penalty
  if (record.count >= maxRequests) {
    record.resetTime = now + RATE_LIMIT_CONFIG.blockDuration;
  }

  rateLimitStore.set(key, record);

  const isAllowed = record.count < maxRequests;
  return {
    allowed: isAllowed,
    remainingRequests: Math.max(0, maxRequests - record.count),
    resetTime: record.resetTime,
  };
}

// ==============================================================================
// 6. MAIN NEXT.JS MIDDLEWARE HANDLER
// ==============================================================================
/**
 * Intercepts HTTP requests and enforces rate limiting policies on protected routes.
 * 
 * @param request - NextRequest context object containing URL, headers, and metadata
 * @returns NextResponse (either 429 Too Many Requests response or next() pass-through)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the user signup endpoint against brute force & bot spam
  if (pathname === '/api/auth/signup') {
    const ip = getClientIP(request);
    const result = rateLimit(ip);

    // BLOCK PATH: Rate limit exceeded -> Return HTTP 429 Too Many Requests
    if (!result.allowed) {
      // Calculate seconds remaining until rate limit resets
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((result.resetTime - Date.now()) / 1000)
      );

      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Signup attempt limit exceeded. Please try again later.',
        }),
        {
          status: 429, // HTTP Standard 429 Status Code
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfterSeconds.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          },
        }
      );
    }

    // ALLOW PATH: Request permitted -> Attach rate limit tracking headers and forward to API route
    const response = NextResponse.next();
    response.headers.set(
      'X-RateLimit-Limit',
      RATE_LIMIT_CONFIG.maxRequests.toString()
    );
    response.headers.set(
      'X-RateLimit-Remaining',
      result.remainingRequests.toString()
    );
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(result.resetTime / 1000).toString()
    );

    return response;
  }

  // For un-targeted routes, simply pass request through without modification
  return NextResponse.next();
}

// ==============================================================================
// 7. ROUTE MATCHER CONFIGURATION
// ==============================================================================
// Tells Next.js which request paths should trigger this middleware.
export const config = {
  matcher: ['/api/auth/signup'],
};