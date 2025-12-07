import { NextResponse } from 'next/server';

/**
 * Health check endpoint to verify deployment status
 */
export async function GET() {
    return NextResponse.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        version: "8f868bf-universal-auth",
        message: "If you see this, the deployment is working. Auth should accept ANY email/password.",
        authMode: "UNIVERSAL",
    });
}
