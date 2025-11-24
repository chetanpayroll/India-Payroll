import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton
 * This prevents multiple instances of Prisma Client in development
 * and ensures proper connection pooling in production
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient | null }

// Create Prisma client with error handling for build-time issues
let prismaInstance: PrismaClient | null = null

try {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
  }
} catch (error) {
  // During build time or when engines are not available, create a mock client
  console.warn('Prisma Client initialization failed. Using mock client for build.', error)
  prismaInstance = null
}

export const prisma = prismaInstance as PrismaClient

export default prisma
