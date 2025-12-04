/**
 * NextAuth v4 API Route Handler
 * Handles all authentication requests at /api/auth/*
 */
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
