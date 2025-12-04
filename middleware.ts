import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const disableAuth = process.env.DISABLE_AUTH === "true";

export default withAuth(
    function middleware(req) {
        if (disableAuth) {
            return NextResponse.next()
        }
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                if (disableAuth) {
                    return true
                }
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
