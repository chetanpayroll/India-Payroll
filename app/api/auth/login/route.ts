import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // ⚠️ TEMPORARY - FOR DEVELOPMENT ONLY ⚠️
        // ACCEPT ANY EMAIL FORMAT (no validation)
        // ACCEPT ANY PASSWORD (no validation, no hashing)

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Auto-create user on first login as per "Auto-Register" requirement
            console.log(`Auto-registering user: ${email}`);
            user = await prisma.user.create({
                data: {
                    email,
                    password, // Store password as plain text for now (dev mode)
                    name: email.split('@')[0],
                    role: 'admin',
                },
            });
        }

        // Generate simple session token
        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

        // Store in session
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
