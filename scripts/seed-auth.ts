import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Hardcoded for seed script execution only
const DATABASE_URL = "postgresql://postgres.tckakhhflkaunqeauvcy:Manish%40123%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";

process.env.DATABASE_URL = DATABASE_URL;
process.env.DIRECT_URL = DATABASE_URL;

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding default Company and Admin User...');

    // 1. Create Default Company
    const company = await prisma.company.upsert({
        where: { pan: 'ABCDE1234F' },
        update: {},
        create: {
            name: 'GMP Technologies India Pvt Ltd',
            legalName: 'GMP Technologies India Private Limited',
            pan: 'ABCDE1234F',
            tan: 'BLRG01234F',
            gstin: '29ABCDE1234F1Z5',
            addressLine1: 'Tech Park, Electronic City',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560100',
            phone: '9876543210',
            email: 'hr@gmp.tech',
            isActive: true,
        },
    });

    console.log(`✅ Company created: ${company.name} (${company.id})`);

    // 2. Create Admin User
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmp.tech' },
        update: {
            password: passwordHash,
            role: 'super_admin',
            isActive: true
        },
        create: {
            name: 'System Admin',
            email: 'admin@gmp.tech',
            password: passwordHash,
            role: 'super_admin',
            isActive: true,
            emailVerified: true
        },
    });

    // 3. Link Admin to Company
    await prisma.companyUser.upsert({
        where: {
            companyId_userId: {
                companyId: company.id,
                userId: admin.id
            }
        },
        update: {},
        create: {
            companyId: company.id,
            userId: admin.id,
            role: 'admin',
            isActive: true,
            permissions: {}
        }
    });

    console.log(`✅ Admin User created: admin@gmp.tech / admin123`);
    console.log(`ℹ️ Use these credentials to login.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
