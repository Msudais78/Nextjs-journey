import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/utils/prisma';
import { isValidEmail, sanitizeString, INPUT_LIMITS } from '@/utils/validation';
import { rateLimit } from '@/middleware';

const MAX_OTP_ATTEMPTS = 5;

export async function POST(request: Request) {
  // Rate limiting: 5 verification attempts per 15 minutes per IP
  const ip = getClientIP(request);
  const limit = rateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 5, prefix: 'verify-otp' });
  if (!limit.allowed) {
    return errorResponse('Too many attempts. Please try again later.', 429);
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

  const { email, otp } = body;

  // Type & presence check
  if (typeof email !== 'string' || typeof otp !== 'string') {
    return errorResponse('Email and OTP code are required.', 400);
  }

  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const trimmedOtp = otp.trim();

  // Email & OTP format validation
  if (!isValidEmail(sanitizedEmail)) {
    return errorResponse('Please provide a valid email address.', 400);
  }

  if (!/^\d{6}$/.test(trimmedOtp)) {
    return errorResponse('OTP must be a 6-digit numeric code.', 400);
  }

  try {
    // 1. Fetch pending registration record
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!pending) {
      return errorResponse(
        'No pending registration found for this email address. Please register again.',
        400
      );
    }

    // 2. Check if OTP has expired
    if (new Date() > pending.otpExpiresAt) {
      // Purge expired record
      await prisma.pendingRegistration.delete({
        where: { email: sanitizedEmail },
      });
      return errorResponse(
        'OTP code has expired. Please initiate signup again to receive a new code.',
        400
      );
    }

    // 3. Check if max failed attempts reached
    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      // Purge compromised record
      await prisma.pendingRegistration.delete({
        where: { email: sanitizedEmail },
      });
      return errorResponse(
        'Maximum verification attempts exceeded. Please register again.',
        400
      );
    }

    // 4. Verify OTP cryptographic hash
    const isOtpValid = await bcrypt.compare(trimmedOtp, pending.otpHash);

    if (!isOtpValid) {
      const newAttempts = pending.attempts + 1;
      const remainingAttempts = MAX_OTP_ATTEMPTS - newAttempts;

      if (remainingAttempts <= 0) {
        await prisma.pendingRegistration.delete({
          where: { email: sanitizedEmail },
        });
        return errorResponse(
          'Invalid OTP. Maximum attempts reached. Registration reset.',
          400
        );
      }

      await prisma.pendingRegistration.update({
        where: { email: sanitizedEmail },
        data: { attempts: newAttempts },
      });

      return errorResponse(
        `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`,
        400
      );
    }

    // 5. Check if user was registered concurrently
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

    // 6. Atomic Transaction: Create User & Purge Pending Registration
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

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
}
