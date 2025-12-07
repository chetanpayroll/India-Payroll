import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
    try {
        // Test database connection
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        // Try a simple query
        const result = await pool.query('SELECT NOW() as current_time');

        await pool.end();

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            currentTime: result.rows[0],
            hasDbUrl: !!process.env.DATABASE_URL,
            dbUrlLength: process.env.DATABASE_URL?.length || 0
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            hasDbUrl: !!process.env.DATABASE_URL,
            dbUrlPreview: process.env.DATABASE_URL?.substring(0, 30) + '...'
        }, { status: 500 });
    }
}
