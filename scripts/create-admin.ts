# ================================================================
# CREATE ADMIN USER SCRIPT
# Run this after database setup to create first admin user
# ================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
    console.log('🔐 Creating admin user...');

    const email = 'admin@gmppayroll.com';
    const password = 'admin123'; // Change this after first login!

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('⚠️  Admin user already exists:', email);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const user = await prisma.user.create({
            data: {
                email,
                name: 'System Administrator',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
            },
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    ', email);
        console.log('🔑 Password: ', password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANT: Change password after first login!');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
