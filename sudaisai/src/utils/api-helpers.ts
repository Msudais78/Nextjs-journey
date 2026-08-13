// src/utils/api-helpers.ts
// Shared functions used by BOTH signup and verify-otp
// This is DRY - write once, use everywhere

import { NextResponse } from 'next/server';

/**
 * Returns a standardized JSON error response
 * Used in both signup and verify-otp routes
 */
export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Returns a standardized JSON success response
 */
export function successResponse(message: string, data?: object) {
  return NextResponse.json({ message, ...data }, { status: 200 });
}

/**
 * Extracts real client IP from proxy headers
 * Works with Vercel, Nginx, Cloudflare etc.
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

/**
 * Safely parses JSON body with size limit
 * Prevents DoS attacks via huge payloads
 * 
 * @param request - Incoming request
 * @param maxBytes - Maximum allowed body size
 */
export async function parseJsonBody(
  request: Request,
  maxBytes: number
): Promise<{ body: any; error: NextResponse | null }> {
  
  // Check Content-Type header first
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return {
      body: null,
      error: errorResponse('Content-Type must be application/json', 415),
    };
  }

  try {
    const text = await request.text();

    // Reject oversized payloads before parsing
    if (text.length > maxBytes) {
      return {
        body: null,
        error: errorResponse('Payload too large', 413),
      };
    }

    const body = JSON.parse(text);
    return { body, error: null };

  } catch {
    return {
      body: null,
      error: errorResponse('Invalid JSON format', 400),
    };
  }
}
