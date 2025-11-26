#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if the GMP Payroll System is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking GMP Payroll System Setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: .env file
console.log('1️⃣  Checking .env file...');
if (!fs.existsSync('.env')) {
  console.log('   ❌ .env file not found');
  console.log('   💡 Create .env file with DATABASE_URL="file:./dev.db"');
  hasErrors = true;
} else {
  const envContent = fs.readFileSync('.env', 'utf8');
  if (!envContent.includes('DATABASE_URL')) {
    console.log('   ⚠️  DATABASE_URL not found in .env');
    hasWarnings = true;
  } else {
    console.log('   ✅ .env file exists with DATABASE_URL');
  }
}

// Check 2: Database file
console.log('\n2️⃣  Checking database file...');
if (!fs.existsSync('prisma/dev.db')) {
  console.log('   ❌ Database file not found');
  console.log('   💡 Run: npx prisma db push');
  hasErrors = true;
} else {
  const stats = fs.statSync('prisma/dev.db');
  console.log(`   ✅ Database exists (${(stats.size / 1024).toFixed(2)} KB)`);
}

// Check 3: Prisma Client
console.log('\n3️⃣  Checking Prisma Client...');
if (!fs.existsSync('node_modules/.prisma/client')) {
  console.log('   ❌ Prisma Client not generated');
  console.log('   💡 Run: npx prisma generate');
  hasErrors = true;
} else {
  console.log('   ✅ Prisma Client generated');
}

// Check 4: node_modules
console.log('\n4️⃣  Checking dependencies...');
if (!fs.existsSync('node_modules')) {
  console.log('   ❌ node_modules not found');
  console.log('   💡 Run: npm install');
  hasErrors = true;
} else {
  const criticalPackages = [
    '@prisma/client',
    'next',
    'react',
    'lucide-react'
  ];

  let missingPackages = [];
  for (const pkg of criticalPackages) {
    if (!fs.existsSync(`node_modules/${pkg}`)) {
      missingPackages.push(pkg);
    }
  }

  if (missingPackages.length > 0) {
    console.log('   ⚠️  Missing packages:', missingPackages.join(', '));
    console.log('   💡 Run: npm install');
    hasWarnings = true;
  } else {
    console.log('   ✅ All critical dependencies installed');
  }
}

// Check 5: Prisma schema
console.log('\n5️⃣  Checking Prisma schema...');
if (!fs.existsSync('prisma/schema.prisma')) {
  console.log('   ❌ Prisma schema not found');
  hasErrors = true;
} else {
  const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');

  // Check provider
  if (schemaContent.includes('provider = "postgresql"')) {
    console.log('   ⚠️  Using PostgreSQL (requires server)');
    console.log('   💡 Consider using SQLite for local dev');
    hasWarnings = true;
  } else if (schemaContent.includes('provider = "sqlite"')) {
    console.log('   ✅ Using SQLite (perfect for local dev)');
  }

  // Check for Leave models
  if (!schemaContent.includes('model Leave {')) {
    console.log('   ❌ Leave model not found in schema');
    hasErrors = true;
  } else {
    console.log('   ✅ Leave models present');
  }
}

// Check 6: Seed script
console.log('\n6️⃣  Checking seed script...');
if (!fs.existsSync('prisma/seed.ts')) {
  console.log('   ⚠️  Seed script not found');
  console.log('   💡 You may need to manually create test data');
  hasWarnings = true;
} else {
  console.log('   ✅ Seed script exists');
}

// Check 7: Build directory
console.log('\n7️⃣  Checking Next.js build...');
if (fs.existsSync('.next')) {
  const buildInfo = fs.existsSync('.next/BUILD_ID');
  if (buildInfo) {
    console.log('   ✅ Application has been built');
  } else {
    console.log('   ⚠️  .next folder exists but may be incomplete');
    hasWarnings = true;
  }
} else {
  console.log('   ℹ️  Not built yet (normal for first run)');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY\n');

if (hasErrors) {
  console.log('❌ Setup has ERRORS - application will not work\n');
  console.log('🔧 Quick fix commands:');
  console.log('   npm install');
  console.log('   npx prisma db push');
  console.log('   npx prisma generate');
  console.log('   npm run db:seed');
  console.log('   npm run dev');
} else if (hasWarnings) {
  console.log('⚠️  Setup has warnings - may cause issues\n');
  console.log('💡 Recommended actions listed above');
} else {
  console.log('✅ Setup looks good!\n');
  console.log('🚀 Ready to run:');
  console.log('   npm run dev');
  console.log('\nThen visit: http://localhost:3000/dashboard/leave');
}

console.log('='.repeat(50) + '\n');

process.exit(hasErrors ? 1 : 0);
