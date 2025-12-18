
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (session && session.expiresAt > new Date()) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error('Error verifying session token:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
