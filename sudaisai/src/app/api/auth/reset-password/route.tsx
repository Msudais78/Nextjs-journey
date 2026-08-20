// ==============================================================================
// RESET PASSWORD API ROUTE HANDLER
// ==============================================================================
// Endpoint: POST /api/auth/reset-password
// Purpose: Processes password reset requests by generating a secure token,
//          storing its hash in the database, and emailing the raw token
//          to the user as a clickable reset link.
// Security: Uses SHA-256 hashing so even if the database is compromised,
//           the raw token cannot be recovered.
// ==============================================================================

// --- Dependency Imports ---
import prisma from "@/utils/prisma";                                          // Prisma ORM client for database operations
import { errorResponse, parseJsonBody, successResponse } from "@/utils/api-helpers"; // Standardized JSON response helpers
import { isValidEmail, INPUT_LIMITS, sanitizeString } from "@/utils/validation";     // Input validation and sanitization utilities
import { sendResetPasswordEmail } from "@/utils/email";                        // Email dispatch function for reset password emails
import crypto from 'crypto';                                                   // Node.js built-in module for cryptographic operations

/**
 * POST Handler — Password Reset Request
 * 
 * Flow:
 * 1. Parse and validate the incoming JSON request body
 * 2. Sanitize and validate the email format
 * 3. Look up the user in the database
 * 4. Generate a cryptographically secure reset token
 * 5. Store the hashed token in the database (replacing any existing tokens)
 * 6. Send the reset email with the raw token embedded in a URL
 * 
 * @param request - Incoming HTTP POST request containing { email: string }
 * @returns JSON response indicating success or failure
 */
export async function POST(request: Request) {

    // Step 1: Safely parse the JSON body with a size limit to prevent DoS via large payloads
    const { body: requestBody, error: parseError } = await parseJsonBody(request, INPUT_LIMITS.REQUEST_BODY_MAX_BYTES);

    // If parsing failed (invalid JSON, wrong content-type, or payload too large), return the error immediately
    if (parseError) {
        return parseError;
    }

    // Step 2: Extract the email field from the parsed request body
    const { email } = requestBody;

    // Validate that an email was provided in the request
    if (!email) {
        return errorResponse('Email is required', 400);
    }

    // Sanitize the email input (trim whitespace, normalize casing)
    const emailTrimmed = sanitizeString(email);

    // Validate the email format using regex-based validation
    if (!isValidEmail(emailTrimmed)) {
        return errorResponse('Invalid email format please type valid email format', 401);
    }

    // Step 3: Look up the user by their email address in the database
    const user = await prisma.user.findUnique({
        where: { email: emailTrimmed }
    })

    // Security: Return a generic message even if the user doesn't exist
    // This prevents email enumeration attacks (attacker can't determine which emails are registered)
    if(!user) {
        return errorResponse('If an account exists, a reset link has been sent', 200);
    }

    // Step 4: Generate cryptographically secure reset token components
    const rawToken = crypto.randomBytes(32).toString('hex');                    // 32-byte random token converted to a 64-character hex string (sent to user via email)
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex'); // SHA-256 hash of the raw token (stored in database for later verification)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);                  // Token expires 15 minutes from now

    // Step 5: Store the hashed token in the database using a transaction
    // Transaction ensures atomicity: both operations succeed or both fail
    await prisma.$transaction([
        // First, delete any existing reset tokens for this user (prevents token accumulation)
        prisma.resetPasswords.deleteMany({
            where: {
                userId: user.id,
            }
        }),
        // Then, create a new reset token record with the hashed token and expiration timestamp
        prisma.resetPasswords.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            }
        })
        
    ]);

    // Step 6: Construct the password reset URL and send it via email
    // The raw (unhashed) token is embedded in the URL so the user can click it
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Application base URL from environment or fallback to localhost
    const resetUrl = `${baseUrl}/auth/new-password?token=${rawToken}`;          // Full reset URL pointing to the new-password page with the token as a query parameter
    
    // Dispatch the reset password email using Nodemailer
    const emailSent = await sendResetPasswordEmail(user.email, resetUrl);
    
    // If the email failed to send (SMTP error, network issue), inform the user
    if (!emailSent) {
        return errorResponse('Failed to send reset email. Please try again later.', 500);
    }

    // Return success response — the reset link has been dispatched
    return successResponse('Reset password link has been sent to your email');
}