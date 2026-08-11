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

// Security constants
const OTP_EXPIRY_MINUTES = 10;
const BCRYPT_ROUNDS = 12;

export async function POST(request: Request) {
  // Rate limit: 3 OTP requests per 15 minutes per IP
  const ip = getClientIP(request);
  const limit = rateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 3, prefix: 'signup-otp' });
  if (!limit.allowed) {
    return errorResponse('Too many requests. Please try again later.', 429);
  }

  // Content-Type check
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return errorResponse('Invalid content type', 415);
  }

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

  // Type & presence validation
  if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
    return errorResponse('Email, username, and password are required.', 400);
  }

  // Sanitization
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const sanitizedUsername = sanitizeString(username);

  // Null byte protection
  if (password.includes('\0')) {
    return errorResponse('Invalid input', 400);
  }

  // Input validation against security rules
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
    // Check if user already exists (do not reveal existence to prevent account enumeration)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: sanitizedEmail }, { username: sanitizedUsername }] },
    });

    if (existingUser) {
      // Still execute password hashing to prevent timing attacks
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      return NextResponse.json(
        { message: 'If the details are valid, an OTP has been sent to your email.' },
        { status: 200 }
      );
    }

    // Check for existing pending registration
    const existingPending = await prisma.pendingRegistration.findUnique({
      where: { email: sanitizedEmail },
    });

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    if (existingPending) {
      // Update existing pending record
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
      // Create new pending record
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

    // Send OTP via email
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

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
}
