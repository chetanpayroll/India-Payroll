import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Secure by default: Real authentication is enabled unless DEMO_MODE is explicitly set to "true"
const isDemoMode = process.env.DEMO_MODE === "true";

export default withAuth(
    function middleware(req) {
        // In demo mode, we can bypass further middleware checks
        if (isDemoMode) {
            return NextResponse.next()
        }
        // Real authentication logic can go here if needed in the future
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                // If in demo mode, always grant access
                if (isDemoMode) {
                    return true
                }

                // In real auth mode, protect dashboard routes
                if (req.nextUrl.pathname.startsWith("/dashboard") && token === null) {
                    return false
                }
                return true
            }
        }
    }
)

export const config = {
    matcher: ["/dashboard/:path*"]
}
