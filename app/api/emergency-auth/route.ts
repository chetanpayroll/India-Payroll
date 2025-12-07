import { NextResponse } from 'next/server';

/**
 * EMERGENCY AUTH BYPASS ENDPOINT
 * This creates a session token manually without going through NextAuth
 * Use this URL to get a direct login token if NextAuth is failing
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        // Generate a mock session token
        const token = Buffer.from(JSON.stringify({
            email: email || 'emergency@admin.com',
            role: 'admin',
            id: 'emergency-' + Date.now(),
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
        })).toString('base64');

        return NextResponse.json({
            success: true,
            message: "Emergency auth bypass successful",
            token: token,
            user: {
                email: email || 'emergency@admin.com',
                role: 'admin'
            },
            instructions: "This is a fallback. NextAuth should be working. Check /api/health for deployment status."
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Send POST request with { email: 'your@email.com' } to get emergency access"
    });
}
