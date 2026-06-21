import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'formflow_super_secret_fallback_key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJWT(payload: { userId: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJWT(token: string): { userId: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<{ id: number; username: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const payload = verifyJWT(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true },
    });

    return user;
  } catch (error) {
    return null;
  }
}
