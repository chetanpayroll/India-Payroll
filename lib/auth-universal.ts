import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * UNIVERSAL AUTHENTICATION - DEMO MODE
 * 
 * ANY email + ANY password = LOGIN SUCCESS
 * Auto-creates users and companies as needed
 * 
 * WARNING: This is for DEMO/TESTING only
 * Remove in production!
 */

export async function authenticateUser(
    email: string,
    password: string
) {
    try {
        // Step 1: Find existing user
        let user = await prisma.user.findUnique({
            where: { email }
        });

        // Step 2: If user doesn't exist, create one
        if (!user) {
            console.log(`[AUTH] Creating new user for: ${email}`);

            // Ensure default company exists
            let defaultCompany = await prisma.company.findFirst({
                where: { name: 'Demo Company' }
            });

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

            // Hash the password (even though we accept any password)
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: email.split('@')[0], // Use email prefix as name
                    role: 'ADMIN', // Give admin access
                    isActive: true,
                    emailVerified: true
                }
            });

            // Create company-user relationship
            await prisma.companyUser.create({
                data: {
                    companyId: defaultCompany.id,
                    userId: user.id,
                    role: 'admin',
                    isActive: true,
                    permissions: {}
                }
            });

            console.log(`[AUTH] User created successfully: ${email}`);
        }

        // Step 3: Always return success (accept any password)
        // In demo mode, we don't verify password
        console.log(`[AUTH] Login successful for: ${email}`);

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };

    } catch (error) {
        console.error('[AUTH] Error:', error);
        throw new Error('Authentication failed');
    }
}
