/**
 * NextAuth v4 Configuration
 * Universal Access Mode
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/auth-universal";

export const authOptions: NextAuthOptions = {
    // ⚠️ DEMO SECRET: Ensures login works even if .env is missing
    secret: process.env.NEXTAUTH_SECRET || "universal-demo-secret-key-2024",
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    providers: [
        CredentialsProvider({
            name: "Universal Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Return null if no input, but don't error out
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                try {
                    // Universal Auth: Accepts ANY Email/Password
                    const user = await authenticateUser(
                        credentials.email,
                        credentials.password
                    );
                    return user;
                } catch (error) {
                    console.error('Auth critical error:', error);
                    // Return null to display "Sign in failed" instead of crashing
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
    },
    debug: true, // Enable debug logs to see why auth might fail
};
