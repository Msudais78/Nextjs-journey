// src/app/api/auth/signup/route.ts
// Step 1 of registration: Validate inputs, save pending record, send OTP
// Returns a JWT token that is REQUIRED for the verify-otp step

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '@/utils/prisma';
import {
  isValidEmail,
  isValidUsername,
  validatePasswordStrength,
  sanitizeString,
  INPUT_LIMITS,
} from '@/utils/validation';
import { sendOTPEmail } from '@/utils/email';
import { createOTPToken } from '@/utils/jwt';
import { errorResponse, parseJsonBody } from '@/utils/api-helpers';

// How long OTP is valid in minutes
const OTP_EXPIRY_MINUTES = 10;

// bcrypt work factor - 12 is good balance of security vs speed
// Higher = slower = harder to brute force
const BCRYPT_ROUNDS = 12;

export async function POST(request: Request) {
  // ─── Step 2: Parse Request Body ────────────────────────────────────────────
  // Using shared utility - no code duplication
  const { body, error: parseError } = await parseJsonBody(
    request,
    INPUT_LIMITS.REQUEST_BODY_MAX_BYTES
  );

  if (parseError) return parseError;

  const { email, username, password } = body;

  if (!email || !username || !password) {
    return errorResponse('Email, username, and password are required.', 400);
  }

  // ─── Step 3: Type Safety Check ─────────────────────────────────────────────
  // Ensures we actually received strings, not objects or arrays (type confusion attacks)
  if (
    typeof email !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return errorResponse('Email, username, and password must be strings.', 400);
  }

  // ─── Step 4: Sanitize Inputs ───────────────────────────────────────────────
  // Remove dangerous characters before any processing
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const sanitizedUsername = sanitizeString(username);

  // Block null bytes specifically in password (bcrypt can mishandle these)
  if (password.includes('\0')) {
    return errorResponse('Invalid characters in password.', 400);
  }

  // ─── Step 5: Format Validation ─────────────────────────────────────────────
  if (!isValidEmail(sanitizedEmail)) {
    return errorResponse('Please enter a valid email address.', 400);
  }

  if (!isValidUsername(sanitizedUsername)) {
    return errorResponse(
      'Username must be 3-30 characters, letters and numbers only.',
      400
    );
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return NextResponse.json(
      { error: 'Password is too weak.', details: passwordCheck.errors },
      { status: 400 }
    );
  }

  // ─── Step 6: Database Operations ───────────────────────────────────────────
  try {
    // Check if email or username is already taken by a REAL user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: sanitizedEmail },
          { username: sanitizedUsername },
        ],
      },
    });

    if (existingUser) {
      // IMPORTANT: We still hash to prevent timing attacks
      // Without this, attackers could tell if an account exists
      // by measuring how fast the response comes back
      await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Generic message - don't tell them if email or username was the problem
      return NextResponse.json(
        { message: 'If these details are available, an OTP will be sent to your email.' },
        { status: 200 }
      );
    }

    // Hash the password BEFORE storing in pending table
    // We never store plain text passwords anywhere
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Generate 6-digit OTP using cryptographically secure random number
    // crypto.randomInt is better than Math.random() for security
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP too - if database is breached, OTPs are still protected
    const otpHash = await bcrypt.hash(otp, 10);

    // Set expiry time
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert = Update if exists, Insert if not
    // Handles case where user retries signup with same email
    await prisma.pendingRegistration.upsert({
      where: { email: sanitizedEmail },
      update: {
        // If they're retrying, update everything with fresh values
        username: sanitizedUsername,
        passwordHash,
        otpHash,
        otpExpiresAt,
      },
      create: {
        // First time signup
        email: sanitizedEmail,
        username: sanitizedUsername,
        passwordHash,
        otpHash,
        otpExpiresAt,
      },
    });

    // Send OTP email BEFORE creating JWT
    // If email fails, we haven't given them a token yet
    await sendOTPEmail(sanitizedEmail, otp);

    // Create JWT token containing the email
    // Frontend MUST send this token with the OTP verification request
    // This proves they went through the signup form first
    const otpToken = createOTPToken(sanitizedEmail);

    const response = NextResponse.json(
      {
        message: 'OTP sent to your email. You have 10 minutes to verify.',
      },
      { status: 200 }
    );

    // Store the JWT in an HTTP-only cookie for enhanced security
    response.cookies.set('otpToken', otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60, // 10 minutes (matches OTP expiry)
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[signup] Unexpected error:', error);
    return errorResponse('An unexpected error occurred. Please try again.', 500);
  }
}
