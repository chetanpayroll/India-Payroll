/**
 * NextAuth v4 Configuration
 * Enterprise Payroll System Authentication
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ⚠️ DEMO MODE: Always enabled for testing/demo purposes
// Set ENABLE_REAL_AUTH=true to use real database authentication
const disableAuth = process.env.ENABLE_REAL_AUTH !== "true";

// Validate required environment variables
if (!disableAuth && !process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not set in environment variables");
}

export const authOptions: NextAuthOptions = {
    // In dev mode with auth disabled, use a dummy secret if not provided
    secret: process.env.NEXTAUTH_SECRET || (disableAuth ? "dev-dummy-secret" : undefined),
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
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // 🚧 DEV MODE: Auth disabled – accept any email/password
                if (disableAuth) {
                    console.log("🚧 DEV MODE: Auth disabled. Logging in as Dev User.");
                    return {
                        id: "dev-user",
                        name: credentials?.email || "Dev User",
                        email: credentials?.email || "dev@example.com",
                        role: "ADMIN", // Full access for dev
                        image: null,
                    };
                }

                // 🔒 REAL AUTH LOGIC
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                };
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
};
