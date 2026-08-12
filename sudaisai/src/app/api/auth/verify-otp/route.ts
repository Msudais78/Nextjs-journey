/**
 * @file src/app/api/auth/verify-otp/route.ts
 * @description Backend HTTP POST API endpoint for verifying 6-digit OTP codes and completing account registration.
 * Performs rate limiting, input validation, pending registration lookup, OTP expiration check,
 * failed attempt tracking with auto-purge, cryptographic bcrypt verification, and atomic Prisma transaction.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/utils/prisma';
import { isValidEmail, sanitizeString, INPUT_LIMITS } from '@/utils/validation';
import { rateLimit } from '@/middleware';

/**
 * Security Constants
 * - MAX_OTP_ATTEMPTS: Maximum allowable failed OTP verification attempts before purging the pending registration record.
 */
const MAX_OTP_ATTEMPTS = 5;

/**
 * Handles incoming POST requests to verify OTP codes and finalize account creation.
 *
 * @param request - The incoming HTTP Request object containing email and 6-digit OTP string.
 * @returns NextResponse JSON object with HTTP 201 Created and user profile on success, or appropriate error status.
 */
export async function POST(request: Request) {
  // 1. IP-based Rate Limiting: Max 5 verification attempts per 15-minute window per IP to prevent OTP brute forcing
  const ip = getClientIP(request);
  const limit = rateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 5, prefix: 'verify-otp' });
  if (!limit.allowed) {
    return errorResponse('Too many attempts. Please try again later.', 429);
  }

  // 2. Content-Type Header Check: Enforce strict application/json content type to prevent request smuggling
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return errorResponse('Invalid content type', 415);
  }

  // 3. Payload Size Limitation & JSON Parsing: Read raw text first and reject if payload exceeds 4KB to block DoS
  let body: any;
  try {
    const text = await request.text();
    if (text.length > INPUT_LIMITS.REQUEST_BODY_MAX_BYTES) {
      return errorResponse('Payload too large', 413);
    }
    body = JSON.parse(text);
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const { email, otp } = body;

  // 4. Type & Presence Safety Check: Ensure email and OTP are provided as strict primitives (mitigates Type Confusion)
  if (typeof email !== 'string' || typeof otp !== 'string') {
    return errorResponse('Email and OTP code are required.', 400);
  }

  // 5. Input Sanitization & Formatting: Normalize email case and trim whitespace from OTP code
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const trimmedOtp = otp.trim();

  // 6. Format Validations: Validate email against RFC 5321 rules and OTP against strict 6-digit numeric regex
  if (!isValidEmail(sanitizedEmail)) {
    return errorResponse('Please provide a valid email address.', 400);
  }

  if (!/^\d{6}$/.test(trimmedOtp)) {
    return errorResponse('OTP must be a 6-digit numeric code.', 400);
  }

  try {
    // 7. Lookup Pending Registration: Fetch the temporary unverified registration record from database
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!pending) {
      return errorResponse(
        'No pending registration found for this email address. Please register again.',
        400
      );
    }

    // 8. TTL Expiration Check: Check if current time exceeds 10-minute OTP expiration window; auto-purge if expired
    if (new Date() > pending.otpExpiresAt) {
      await prisma.pendingRegistration.delete({
        where: { email: sanitizedEmail },
      });
      return errorResponse(
        'OTP code has expired. Please initiate signup again to receive a new code.',
        400
      );
    }

    // 9. Failed Attempt Counter Enforcement: Check if max failed attempts have already been breached; purge if compromised
    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.pendingRegistration.delete({
        where: { email: sanitizedEmail },
      });
      return errorResponse(
        'Maximum verification attempts exceeded. Please register again.',
        400
      );
    }

    // 10. Cryptographic OTP Verification: Compare submitted 6-digit code with stored bcrypt OTP hash
    const isOtpValid = await bcrypt.compare(trimmedOtp, pending.otpHash);

    if (!isOtpValid) {
      const newAttempts = pending.attempts + 1;
      const remainingAttempts = MAX_OTP_ATTEMPTS - newAttempts;

      // If attempts reach zero, purge the pending record to force re-signup
      if (remainingAttempts <= 0) {
        await prisma.pendingRegistration.delete({
          where: { email: sanitizedEmail },
        });
        return errorResponse(
          'Invalid OTP. Maximum attempts reached. Registration reset.',
          400
        );
      }

      // Otherwise increment attempt counter in database
      await prisma.pendingRegistration.update({
        where: { email: sanitizedEmail },
        data: { attempts: newAttempts },
      });

      return errorResponse(
        `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`,
        400
      );
    }

    // 11. Concurrent User Check: Verify email or username wasn't registered concurrently by another session
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: pending.email }, { username: pending.username }],
      },
    });

    if (existingUser) {
      await prisma.pendingRegistration.delete({
        where: { email: sanitizedEmail },
      });
      return errorResponse('User with this email or username is already registered.', 409);
    }

    // 12. Atomic Prisma Transaction: Create permanent User record & purge PendingRegistration record atomically
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: pending.email,
          username: pending.username,
          passwordHash: pending.passwordHash,
          isEmailVerified: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          isEmailVerified: true,
          role: true,
          createdAt: true,
        },
      });

      await tx.pendingRegistration.delete({
        where: { email: pending.email },
      });

      return createdUser;
    });

    // 13. Success Response: Return HTTP 201 Created with sanitized user object (excluding password hash)
    return NextResponse.json(
      {
        message: 'Account verified and registered successfully!',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse('An unexpected error occurred during OTP verification.', 500);
  }
}

/**+
 * Formats a standardized JSON error response object.
 *
 * @param message - Descriptive human-readable error string.
 * @param status - HTTP status code.
 * @returns NextResponse JSON response object.
 */
function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Extracts the client IP address from request headers with local fallback.
 *
 * @param request - Incoming HTTP Request object.
 * @returns Client IP address string.
 */
function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
}

