import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  isValidEmail,
  sanitizeString,
  INPUT_LIMITS
} from '@/utils/validation';
import prisma from '@/utils/prisma';
import {
  
  errorResponse,
  parseJsonBody,
  successResponse
} from '@/utils/api-helpers';

export async function POST(request: Request) {
  const { body: requestBody, error: parseError } = await parseJsonBody(request, INPUT_LIMITS.REQUEST_BODY_MAX_BYTES);

  if (parseError) {
    return parseError;
  }

  const { email, password } = requestBody;

  if (!email || !password) {
    return errorResponse('Email and password are required', 400);
  }

  // Sanitize email, but strictly leave the password exactly as entered
  const emailTrimmed = sanitizeString(email);
  const passwordRaw = password;

  if (!isValidEmail(emailTrimmed)) {
    return errorResponse('Invalid email or password', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: emailTrimmed },
    });

    // Generic error to prevent user enumeration
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(passwordRaw, user.passwordHash);

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Embed the role alongside the ID for fast RBAC checks
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // SECURE DELIVERY: Set the token as an HttpOnly cookie directly from the server
    const response = successResponse('Login successful', { 
      user: { id: user.id, username: user.username, email: user.email, role: user.role } 
    });

    response.cookies.set({
      name: 'session_token',
      value: token,
      httpOnly: true, // Prevents JavaScript/XSS access
      secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
      sameSite: 'strict', // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}