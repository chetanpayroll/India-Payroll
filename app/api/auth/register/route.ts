import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'User already exists. Please login.' },
                { status: 409 }
            );
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                password, // Plain text for dev
                name: name || email.split('@')[0],
                role: 'admin',
            },
        });

        // Auto-login after registration
        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

        await prisma.session.create({
            data: {
                userId: newUser.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
