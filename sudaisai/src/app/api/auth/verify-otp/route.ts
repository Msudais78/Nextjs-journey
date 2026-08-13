// src/app/api/auth/verify-otp/route.ts
// Step 2 of registration: Verify OTP using JWT token from signup step
// 
// WHAT THIS DOES (very different from signup):
// - Does NOT accept email/username/password from user
// - Instead reads email FROM the JWT token (user cannot fake this)
// - Only needs: the OTP code + the JWT token
// - If OTP matches → creates real User account → deletes pending record

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/utils/prisma';
import { sanitizeString, INPUT_LIMITS } from '@/utils/validation';
import { verifyOTPToken, extractBearerToken } from '@/utils/jwt';
import { errorResponse, parseJsonBody } from '@/utils/api-helpers';

export async function POST(request: NextRequest) {
  // ─── Step 2: Extract & Verify JWT Token ────────────────────────────────────
  // This is the GATE that prevents direct access to this endpoint
  // Without a valid JWT from the signup step, you cannot proceed
  const rawToken = request.cookies.get('otpToken')?.value || extractBearerToken(request);

  if (!rawToken) {
    // They tried to call verify-otp without going through signup first
    return errorResponse(
      'Verification token is missing. Please complete the signup form first.',
      401
    );
  }

  // Decode and validate the JWT
  // This will throw if token is expired, tampered, or invalid
  let tokenPayload: { email: string };
  try {
    tokenPayload = verifyOTPToken(rawToken);
  } catch (error) {
    // Token was invalid or expired
    return errorResponse(
      error instanceof Error
        ? error.message
        : 'Invalid verification token. Please sign up again.',
      401
    );
  }

  // Email comes FROM the JWT - user cannot manipulate this
  // This is safer than accepting email in the request body
  const emailFromToken = tokenPayload.email;

  // ─── Step 3: Parse Request Body ────────────────────────────────────────────
  // verify-otp only needs the OTP code from the request body
  // Everything else comes from the JWT token
  const { body, error: parseError } = await parseJsonBody(
    request,
    INPUT_LIMITS.REQUEST_BODY_MAX_BYTES
  );

  if (parseError) return parseError;

  const { otp } = body;

  // ─── Step 4: Validate OTP Format ───────────────────────────────────────────
  if (typeof otp !== 'string') {
    return errorResponse('OTP must be a string.', 400);
  }

  // Sanitize and clean the OTP input
  const sanitizedOTP = sanitizeString(otp).trim();

  // OTP must be exactly 6 digits, nothing else
  if (!/^\d{6}$/.test(sanitizedOTP)) {
    return errorResponse('OTP must be exactly 6 digits.', 400);
  }

  // ─── Step 5: Find Pending Registration ─────────────────────────────────────
  try {
    // Look up pending registration using email from JWT (not from user input)
    const pendingRecord = await prisma.pendingRegistration.findUnique({
      where: { email: emailFromToken },
    });

    if (!pendingRecord) {
      // Their signup session doesn't exist or already completed
      return errorResponse(
        'No pending registration found. Please sign up again.',
        404
      );
    }

    // ─── Step 6: Check If OTP Has Expired ────────────────────────────────────
    const now = new Date();
    if (pendingRecord.otpExpiresAt < now) {
      // Clean up expired record from database
      await prisma.pendingRegistration.delete({
        where: { email: emailFromToken },
      });

      return errorResponse(
        'OTP has expired. Please sign up again to receive a new OTP.',
        410 // 410 Gone - resource no longer available
      );
    }

    // ─── Step 8: Verify OTP ───────────────────────────────────────────────────
    // bcrypt.compare safely checks if submitted OTP matches the stored hash
    // This is timing-safe by default (bcrypt handles this internally)
    const isOTPValid = await bcrypt.compare(sanitizedOTP, pendingRecord.otpHash);

    if (!isOTPValid) {
      return errorResponse(
        'Incorrect OTP.',
        400
      );
    }

    // ─── Step 9: OTP is Correct - Create Real User Account ───────────────────
    // Use a database transaction so BOTH operations succeed or BOTH fail
    // We never want a situation where pending is deleted but user isn't created
    await prisma.$transaction(async (tx) => {
      // Create the real user account using data from pending registration
      // The password was already hashed during signup - we reuse that hash
      await tx.user.create({
        data: {
          email: pendingRecord.email,
          username: pendingRecord.username,
          passwordHash: pendingRecord.passwordHash, // Reuse hash from signup
          isEmailVerified: true, // They just verified their email!
          role: 'USER',
        },
      });

      // Clean up the pending registration record
      // It's no longer needed now that user is created
      await tx.pendingRegistration.delete({
        where: { email: emailFromToken },
      });
    });

    // ─── Step 10: Return Success ──────────────────────────────────────────────
    const response = NextResponse.json(
      {
        message: 'Email verified successfully! Your account has been created.',
      },
      { status: 201 } // 201 Created - a new resource was created
    );

    // Clean up the OTP cookie since the registration is complete
    response.cookies.delete('otpToken');

    return response;

  } catch (error) {
    console.error('[verify-otp] Unexpected error:', error);
    return errorResponse('An unexpected error occurred. Please try again.', 500);
  }
}
