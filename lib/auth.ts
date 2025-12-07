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
                // 🚧 UNIVERSAL AUTH: Accept ANY email/password for demo purposes
                if (disableAuth) {
                    console.log("🚧 DEMO MODE: Universal authentication enabled");

                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Email and password required");
                    }

                    try {
                        // Step 1: Try to find existing user
                        let user = await prisma.user.findUnique({
                            where: { email: credentials.email }
                        });

                        // Step 2: If user doesn't exist, create one
                        if (!user) {
                            console.log(`[AUTH] Creating new user for: ${credentials.email}`);

                            // Ensure default company exists
                            let defaultCompany = await prisma.company.findFirst({
                                where: { name: 'Demo Company' }
                            });

                            if (!defaultCompany) {
                                console.log('[AUTH] Creating default company');
                                defaultCompany = await prisma.company.create({
                                    data: {
                                        name: 'Demo Company',
                                        legalName: 'Demo Company Pvt Ltd',
                                        pan: 'AAAAA0000A',
                                        tan: 'DEMO00000A',
                                        addressLine1: 'Demo Address, India',
                                        city: 'Mumbai',
                                        state: 'Maharashtra',
                                        postalCode: '400001',
                                        country: 'India',
                                        isActive: true
                                    }
                                });
                            }

                            // Hash the password (even though we accept any password in demo mode)
                            const hashedPassword = await bcrypt.hash(credentials.password, 10);

                            // Create user with super_admin role
                            user = await prisma.user.create({
                                data: {
                                    email: credentials.email,
                                    password: hashedPassword,
                                    name: credentials.email.split('@')[0], // Use email prefix as name
                                    role: 'super_admin',
                                    isActive: true,
                                    emailVerified: true
                                }
                            });

                            // Create company-user relationship
                            await prisma.companyUser.create({
                                data: {
                                    companyId: defaultCompany.id,
                                    userId: user.id,
                                    role: 'super_admin',
                                    isActive: true
                                }
                            });

                            console.log(`[AUTH] User created successfully: ${credentials.email}`);
                        }

                        // Step 3: Always return success (accept any password in demo mode)
                        console.log(`[AUTH] Login successful for: ${credentials.email}`);

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                        };

                    } catch (error) {
                        console.error('[AUTH] Error during universal auth:', error);
                        throw new Error('Authentication failed');
                    }
                }

                // 🔒 PRODUCTION AUTH LOGIC (used when ENABLE_REAL_AUTH=true)
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
