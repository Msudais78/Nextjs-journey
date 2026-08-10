// Next.js Middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,            // max signup attempts per window
  blockDuration: 60 * 60 * 1000, // 1 hour block after exceeded
};

function getClientIP(request: NextRequest): string {
  // Trust only known proxy headers in controlled environments
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // Take only the FIRST IP (client), ignore proxy chain
    const firstIP = forwarded.split(',')[0].trim();
    if (isValidIP(firstIP)) return firstIP;
  }
  
  if (realIP && isValidIP(realIP)) return realIP;
  
  return 'unknown';
}

function isValidIP(ip: string): boolean {
  // Basic IPv4 and IPv6 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export function rateLimit(ip: string): {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
} {
  const now = Date.now();
  const key = `signup:${ip}`;
  const record = rateLimitStore.get(key);

  // Clean expired records periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) rateLimitStore.delete(k);
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    });
    return {
      allowed: true,
      remainingRequests: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    };
  }

  if (record.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remainingRequests: RATE_LIMIT_CONFIG.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}