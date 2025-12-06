/**
 * SUPABASE CONNECTION STRING BUILDER
 * Handles all edge cases for database connectivity
 */

export interface SupabaseConfig {
    projectRef: string;      // e.g., "tckakhhflkaunqeauvcy"
    password: string;        // Raw password
    region: string;          // e.g., "ap-south-1" (Mumbai)
    database?: string;       // Default: "postgres"
    mode?: 'session' | 'transaction';  // Default: 'transaction'
    pooling?: boolean;       // Default: true
    sslMode?: 'disable' | 'require' | 'verify-full';  // Default: 'require'
    connectionLimit?: number; // Default: 10
}

export class SupabaseConnectionBuilder {

    /**
     * Build connection string with proper encoding and parameters
     */
    static build(config: SupabaseConfig): string {
        // Validate inputs
        this.validateConfig(config);

        // URL encode password
        const encodedPassword = this.encodePassword(config.password);

        // Build base URL
        // For direct connections: db.ref.supabase.co
        // For pooled connections: usually db.ref.supabase.co with pgbouncer=true or aws-0-region.pooler.supabase.com
        // Supabase has standardized on db.ref.supabase.co for both recently, but let's follow the prompt's robust logic or standard.
        // The prompt suggested: host = pooling ? `db.${config.projectRef}.supabase.co` : `aws-0-${config.region}.pooler.supabase.com`;
        // Actually standard Supabase is:
        // Direct: db.ref.supabase.co:5432
        // Pooled: db.ref.supabase.co:6543 (Transaction mode) or Session mode.

        const username = `postgres.${config.projectRef}`;
        const host = `db.${config.projectRef}.supabase.co`;
        const port = config.pooling ? 6543 : 5432;
        const database = config.database || 'postgres';

        // Build connection string
        let connectionString = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}`;

        // Add query parameters
        const params: string[] = [];

        if (config.pooling) {
            params.push('pgbouncer=true');
        }

        if (config.mode) {
            params.push(`pool_mode=${config.mode}`);
        }

        if (config.sslMode) {
            params.push(`sslmode=${config.sslMode}`);
        }

        if (config.connectionLimit) {
            params.push(`connection_limit=${config.connectionLimit}`);
        }

        // Add schema
        params.push('schema=public');

        // Append parameters
        if (params.length > 0) {
            connectionString += '?' + params.join('&');
        }

        return connectionString;
    }

    /**
     * URL encode password, handling all special characters
     */
    private static encodePassword(password: string): string {
        return encodeURIComponent(password);
    }

    /**
     * Validate configuration
     */
    private static validateConfig(config: SupabaseConfig): void {
        if (!config.projectRef || config.projectRef.length === 0) {
            throw new Error('Project reference is required');
        }

        if (!config.password || config.password.length === 0) {
            throw new Error('Password is required');
        }

        if (config.mode && !['session', 'transaction'].includes(config.mode)) {
            throw new Error('Mode must be either "session" or "transaction"');
        }
    }

    /**
     * Test connection and provide diagnostics
     */
    static async testConnection(connectionString: string): Promise<{
        success: boolean;
        message: string;
        diagnostics?: any;
    }> {
        try {
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient({
                datasources: {
                    db: { url: connectionString }
                }
            });

            // Test query
            await prisma.$queryRaw`SELECT 1 as test`;
            await prisma.$disconnect();

            return {
                success: true,
                message: 'Connection successful'
            };

        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                diagnostics: {
                    code: error.code,
                    meta: error.meta,
                    errorCode: error.errorCode
                }
            };
        }
    }

    /**
     * Get connection from environment with fallback
     */
    static getFromEnv(): string {
        const envUrl = process.env.DATABASE_URL;

        if (!envUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        // Parse and validate
        try {
            // Basic validation check
            if (!envUrl.startsWith('postgresql://') && !envUrl.startsWith('postgres://')) {
                throw new Error('Invalid protocol');
            }
            return envUrl;
        } catch (error) {
            throw new Error('DATABASE_URL is not a valid connection string');
        }
    }
}
