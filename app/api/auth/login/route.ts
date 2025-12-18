import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

        const isDemoMode = process.env.DEMO_MODE === "true";

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (user) {
            // User exists
            if (isDemoMode) {
                console.log(`Updating password for existing user in demo mode: ${email}`);
                const hashedPassword = await bcrypt.hash(password, 10);
                user = await prisma.user.update({
                    where: { email },
                    data: { password: hashedPassword },
                });
            } else {
                // This is the real authentication path
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    return NextResponse.json(
                        { error: 'Invalid credentials' },
                        { status: 401 }
                    );
                }
            }
        } else {
            // User does not exist
            if (isDemoMode) {
                console.log(`Auto-registering user in demo mode: ${email}`);
                const hashedPassword = await bcrypt.hash(password, 10);
                user = await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        name: email.split('@')[0],
                        role: 'admin',
                    },
                });
            } else {
                return NextResponse.json(
                    { error: 'Invalid credentials' },
                    { status: 401 }
                );
            }
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
