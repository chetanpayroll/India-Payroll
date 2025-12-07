/**
 * NextAuth v4 API Route Handler - ULTRA SIMPLIFIED
 * This version is completely self-contained to prevent ANY runtime errors
 */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ✅ INLINE AUTH OPTIONS - No external imports that could fail
const handler = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || "fallback-demo-secret-2024",

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },

    pages: {
        signIn: "/auth/login",
    },

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // ✅ UNIVERSAL LOGIN: Accept ANY credentials
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                console.log(`[AUTH] Granting access to: ${credentials.email}`);

                // Return a valid user object
                return {
                    id: "user-" + Date.now(),
                    email: credentials.email,
                    name: credentials.email.split("@")[0],
                    role: "admin",
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role || "admin";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },

    debug: true,
});

export { handler as GET, handler as POST };
