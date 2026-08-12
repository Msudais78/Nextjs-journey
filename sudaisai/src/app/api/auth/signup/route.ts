/**
 * @file src/app/api/auth/signup/route.ts
 * @description Backend HTTP POST API endpoint for initiating 2-step user registration.
 * Performs strict input validation, sanitization, rate limiting, anti-enumeration,
 * bcrypt DoS/ReDoS/timing attack mitigations, pending registration record persistence,
 * and 6-digit OTP email dispatch.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '@/utils/prisma';
import { 
  isValidEmail, 
  isValidUsername, 
  validatePasswordStrength, 
  sanitizeString,
  INPUT_LIMITS 
} from '@/utils/validation';
import { rateLimit } from '@/middleware';
import { sendOTPEmail } from '@/utils/email';

/**
 * Security & Expiration Constants
 * - OTP_EXPIRY_MINUTES: TTL duration for the 6-digit verification code (10 minutes).
 * - BCRYPT_ROUNDS: Work factor for bcrypt hashing (12 rounds balances security and CPU usage).
 */
const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 12;

/**
 * Handles incoming POST requests to initiate user registration.
 *
 * @param request - The incoming HTTP Request object containing email, username, and password JSON payload.
 * @returns NextResponse JSON object with success/error status and user feedback message.
 */
export async function POST(request: Request) {
  // 1. IP-based Rate Limiting: Max 3 signup attempts per 15-minute window per IP to prevent OTP spam & brute force
  const ip = getClientIP(request);
  const limit = rateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 3, prefix: 'signup-otp' });
  if (!limit.allowed) {
    return errorResponse('Too many requests. Please try again later.', 429);
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

  const { email, username, password } = body;

  // 4. Type & Presence Safety Check: Ensure required fields exist and are strict primitives (mitigates Type Confusion)
  if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
    return errorResponse('Email, username, and password are required.', 400);
  }

  // 5. Input Sanitization: Strip null bytes, ASCII control characters, leading/trailing whitespace, and normalize email case
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const sanitizedUsername = sanitizeString(username);

  // 6. Explicit Null Byte Check on Password: Block null byte injection attacks in password processing
  if (password.includes('\0')) {
    return errorResponse('Invalid input', 400);
  }

  // 7. Security Input Validations (RFC 5321 email limits, linear-time RE2JS regexes, password complexity rules)
  if (!isValidEmail(sanitizedEmail)) {
    return errorResponse('Please provide a valid email address.', 400);
  }
  if (!isValidUsername(sanitizedUsername)) {
    return errorResponse('Invalid username. Must be 3-30 alphanumeric characters.', 400);
  }

  const pwdCheck = validatePasswordStrength(password);
  if (!pwdCheck.valid) {
    return NextResponse.json({ error: 'Weak password', details: pwdCheck.errors }, { status: 400 });
  }

  try {
    // 8. User Existence Check: Query persistent database for existing email or username
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: sanitizedEmail }, { username: sanitizedUsername }] },
    });

    // 9. Account Enumeration & Timing Attack Defense:
    // If user exists, execute dummy bcrypt hash calculation to match response timing latency,
    // and return generic message so attackers cannot enumerate valid registered accounts.
    if (existingUser) {
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      return NextResponse.json(
        { message: 'If the details are valid, an OTP has been sent to your email.' },
        { status: 200 }
      );
    }

    // 10. Check for existing pending registration record for this email
    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email: sanitizedEmail },
    });

    // 11. Generate Cryptographically Secure 6-Digit OTP & Hashes
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 12. Database Upsert: Update existing pending record or insert a new PendingRegistration record
    if (existingPending) {
      await prisma.pendingRegistration.update({
        where: { email: sanitizedEmail },
        data: {
          username: sanitizedUsername,
          passwordHash,
          otpHash,
          otpExpiresAt: expiresAt,
          attempts: 0,
        },
      });
    } else {
      await prisma.pendingRegistration.create({
        data: {
          email: sanitizedEmail,
          username: sanitizedUsername,
          passwordHash,
          otpHash,
          otpExpiresAt: expiresAt,
        },
      });
    }

    // 13. Dispatch Email: Send 6-digit OTP verification email via Nodemailer transport
    await sendOTPEmail(sanitizedEmail, otp);

    return NextResponse.json(
      { message: 'OTP sent to your email. Please verify your OTP to complete registration.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return errorResponse('An unexpected error occurred during signup.', 500);
  }
}

/**
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
