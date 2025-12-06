/**
 * DATABASE CONNECTION DIAGNOSTIC TOOL
 * Run this to troubleshoot connection issues
 */

import { SupabaseConnectionBuilder } from '../lib/database/connection-builder';

async function diagnose() {
    console.log('🔍 GMP Payroll - Database Connection Diagnostics\n');

    // Step 1: Check environment variable
    console.log('📋 Step 1: Checking environment variable...');
    const envUrl = process.env.DATABASE_URL;

    if (!envUrl) {
        console.error('❌ DATABASE_URL is not set in environment');
        console.log('💡 Solution: Create .env file with DATABASE_URL');
        return;
    }

    console.log('✅ DATABASE_URL is set');
    // Mask password
    const maskedUrl = envUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`   ${maskedUrl}`);

    // Step 2: Parse connection string
    console.log('\n📋 Step 2: Parsing connection string...');
    try {
        // URL parsing might fail if special chars. Try/Wait.
        // Replace postgresql:// with http:// for URL parser compatibility
        const urlStr = envUrl.replace('postgresql://', 'http://').replace('postgres://', 'http://');
        const url = new URL(urlStr);
        console.log('✅ Connection string is valid URI format');
        console.log(`   Host: ${url.hostname}`);
        console.log(`   Port: ${url.port || '5432'}`);
        console.log(`   Database: ${url.pathname.slice(1)}`);
        console.log(`   Username: ${url.username}`);
        console.log(`   Parameters: ${url.search}`);
    } catch (error) {
        console.error('❌ Connection string is malformed or contains unescaped characters');
        return;
    }

    // Step 4: Test database connection
    console.log('\n📋 Step 4: Testing database connection...');
    const result = await SupabaseConnectionBuilder.testConnection(envUrl);

    if (result.success) {
        console.log('✅ Database connection successful!');
        console.log('✅ All diagnostics passed\n');
        console.log('🎉 Your database is ready to use!');
    } else {
        console.error('❌ Database connection failed');
        console.error(`   Error: ${result.message}`);

        if (result.diagnostics) {
            console.error(`   Code: ${result.diagnostics.code}`);
            console.error(`   Details: ${JSON.stringify(result.diagnostics.meta, null, 2)}`);
        }

        console.log('\n💡 Common solutions:');
        console.log('   1. Check if using port 6543 (pooled connection)');
        console.log('   2. Verify password is URL-encoded');
        console.log('   3. Check if database is paused (Supabase dashboard)');
        console.log('   4. Reset password in Supabase dashboard');
        console.log('   5. Use "Connection pooling" URL from Supabase');
    }
}

// Run diagnostics
diagnose().catch(console.error);
