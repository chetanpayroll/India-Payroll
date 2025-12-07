import { prisma } from '@/lib/prisma';

/**
 * UNIVERSAL AUTHENTICATION - DEMO MODE
 * 
 * ANY email + ANY password = LOGIN SUCCESS
 * 
 * ROBUSTNESS UPDATE:
 * 1. Checks if Prisma Client is actually connected/initialized
 * 2. Falls back to Memory Mode if Database is unreachable or Prisma is null
 */

// Dummy hash for demo purposes
const DUMMY_HASH = "$2a$10$demodummyhashforuniversalaccessmodeonly";

export async function authenticateUser(
    email: string,
    password: string
) {
    try {
        console.log(`[AUTH] Attempting login for: ${email}`);

        // 🛡️ BLOCK A: DATABASE ATTEMPT
        // First, check if prisma client is valid to avoid "Cannot read properties of null"
        if (!prisma) {
            console.warn('[AUTH] Prisma Client is null/unavailable. Switching to Fallback.');
            throw new Error("Prisma Client Not Initialized");
        }

        try {
            // Step 1: Find existing user
            let user = await prisma.user.findUnique({
                where: { email }
            });

            // Step 2: If user doesn't exist, create one
            if (!user) {
                console.log(`[AUTH] Creating new user for: ${email}`);

                // Ensure default company exists or create it
                let defaultCompany = await prisma.company.findFirst();

                if (!defaultCompany) {
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

                // Create user with dummy hash
                user = await prisma.user.create({
                    data: {
                        email,
                        password: DUMMY_HASH, // No bcrypt needed
                        name: email.split('@')[0],
                        role: 'ADMIN',
                        isActive: true,
                        emailVerified: true
                    }
                });

                // Link User to Company
                try {
                    await prisma.companyUser.create({
                        data: {
                            companyId: defaultCompany.id,
                            userId: user.id,
                            role: 'admin',
                            isActive: true,
                            permissions: {}
                        }
                    });
                } catch (linkError) {
                    console.warn('[AUTH] Linking company failed (might already exist), ignoring.', linkError);
                }
            }

            console.log(`[AUTH] DB Login successful for: ${email}`);

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            };

        } catch (dbError) {
            console.error('[AUTH] Database operation failed. Switching to Fallback Mode.', dbError);
            throw dbError;
        }

    } catch (error) {
        console.warn('[AUTH] System Error (DB or other). Using FAILSAFE MOCK USER.');

        // 🛡️ BLOCK B: FAILSAFE MOCK USER
        return {
            id: 'mock-auth-' + Date.now(),
            email: email,
            name: email.split('@')[0] || 'Admin',
            role: 'ADMIN',
            image: null
        };
    }
}
