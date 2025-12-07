import { Pool } from 'pg'
import { randomUUID } from 'crypto'

/**
 * Lightweight Database Client Workaround
 * Using pg directly due to Prisma engine download restrictions
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Mock Prisma-like client using pg
const createMockPrismaClient = () => {
  return {
    user: {
      findUnique: async ({ where }: any) => {
        const { email, id } = where
        const query = email
          ? 'SELECT * FROM users WHERE email = $1 LIMIT 1'
          : 'SELECT * FROM users WHERE id = $1 LIMIT 1'
        const value = email || id
        const result = await pool.query(query, [value])
        return result.rows[0] || null
      },
      create: async ({ data }: any) => {
        const id = randomUUID()
        const query = `
          INSERT INTO users (id, email, password_hash, name, role, is_active, email_verified, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          RETURNING *
        `
        const result = await pool.query(query, [
          id,
          data.email,
          data.password,
          data.name,
          data.role || 'employee',
          true,
          false,
        ])
        return result.rows[0]
      },
      findMany: async ({ where }: any = {}) => {
        let query = 'SELECT * FROM users'
        const values: any[] = []
        if (where) {
          const conditions: string[] = []
          let paramIndex = 1
          if (where.email) {
            conditions.push(`email = $${paramIndex++}`)
            values.push(where.email)
          }
          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ')
          }
        }
        const result = await pool.query(query, values)
        return result.rows
      },
    },
    session: {
      create: async ({ data }: any) => {
        const id = randomUUID()
        const query = `
          INSERT INTO sessions (id, user_id, token, expires_at, created_at, ip_address, user_agent)
          VALUES ($1, $2, $3, $4, NOW(), $5, $6)
          RETURNING *
        `
        const result = await pool.query(query, [
          id,
          data.userId,
          data.token,
          data.expiresAt,
          data.ipAddress || null,
          data.userAgent || null,
        ])
        return result.rows[0]
      },
      findUnique: async ({ where }: any) => {
        const { token } = where
        const query = 'SELECT * FROM sessions WHERE token = $1 LIMIT 1'
        const result = await pool.query(query, [token])
        return result.rows[0] || null
      },
      delete: async ({ where }: any) => {
        const { token } = where
        const query = 'DELETE FROM sessions WHERE token = $1 RETURNING *'
        const result = await pool.query(query, [token])
        return result.rows[0] || null
      },
    },
    $disconnect: async () => {
      await pool.end()
    },
  }
}

export const prisma = createMockPrismaClient() as any

export default prisma
