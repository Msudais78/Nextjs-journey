// src/utils/jwt.ts
// Handles creating and reading JWT tokens for OTP verification flow

import jwt from 'jsonwebtoken';

// This secret MUST be in your .env file
// Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
const JWT_SECRET = process.env.JWT_SECRET!;

// Token expires in 15 minutes - matches OTP window
const OTP_TOKEN_EXPIRY = '15m';

/**
 * The data we store inside the JWT token.
 * We only store email - nothing sensitive like passwords!
 */
interface OTPTokenPayload {
  email: string;
  purpose: 'otp-verification'; // Prevents token from being used for other things
}

/**
 * Creates a signed JWT token containing the user's email.
 * This token is returned to the frontend after signup form submission.
 * The frontend must send this token when submitting the OTP.
 * 
 * @param email - The email address to encode in the token
 * @returns Signed JWT string
 */
export function createOTPToken(email: string): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const payload: OTPTokenPayload = {
    email,
    purpose: 'otp-verification',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: OTP_TOKEN_EXPIRY,
  });
}

/**
 * Verifies and decodes a JWT token from the verify-otp request.
 * Returns the payload if valid, throws an error if invalid or expired.
 * 
 * @param token - JWT string from the request Authorization header
 * @returns Decoded payload containing email
 * @throws Error if token is invalid, expired, or tampered with
 */
export function verifyOTPToken(token: string): OTPTokenPayload {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as OTPTokenPayload;

    // Extra safety check - make sure this token is for OTP verification
    // not accidentally used from another flow
    if (decoded.purpose !== 'otp-verification') {
      throw new Error('Invalid token purpose');
    }

    return decoded;

  } catch (error) {
    // jwt.verify throws specific errors we can check
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('OTP session has expired. Please sign up again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token. Please sign up again.');
    }
    throw error;
  }
}

/**
 * Extracts Bearer token from Authorization header.
 * Header format: "Authorization: Bearer <token>"
 * 
 * @param request - Incoming HTTP request
 * @returns Token string or null if not found
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // "Bearer <token>" → "<token>"
  const token = authHeader.substring(7).trim();
  return token.length > 0 ? token : null;
}
