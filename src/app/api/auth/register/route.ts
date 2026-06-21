import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, signJWT } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password || username.trim() === '' || password.length < 6) {
      return NextResponse.json(
        { error: 'Username required and password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    const token = signJWT({ userId: user.id, username: user.username });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
