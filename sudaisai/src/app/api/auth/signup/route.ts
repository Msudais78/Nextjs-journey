import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/utils/prisma';
import { isValidEmail, isValidPassword } from '@/utils/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // 1. Validation: check missing fields
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required.' },
        { status: 400 }
      );
    }

    // 2. Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Validate password format & security
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long and contain at least one letter and one number.' },
        { status: 400 }
      );
    }

    // 4. Check if user already exists (by email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.trim() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'A user with this email already exists.' },
          { status: 409 }
        );
      }
      if (existingUser.username.toLowerCase() === username.trim().toLowerCase()) {
        return NextResponse.json(
          { error: 'This username is already taken.' },
          { status: 409 }
        );
      }
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully.',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during signup.' },
      { status: 500 }
    );
  }
}
