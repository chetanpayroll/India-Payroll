# Known Issues and Workarounds

## Prisma Client Generation Issue

### Problem
The Prisma client cannot be generated in environments with restricted network access to `binaries.prisma.sh`. This affects the build process as Prisma needs to download platform-specific query engines.

### Error Messages
```
Error: Failed to fetch sha256 checksum at https://binaries.prisma.sh/all_commits/.../debian-openssl-3.0.x/schema-engine.sha256 - 403 Forbidden
Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
```

### Workarounds

#### Option 1: Generate Prisma Client in Unrestricted Environment
1. Generate the Prisma client on a machine with full internet access:
   ```bash
   npx prisma generate
   ```
2. Copy the generated `node_modules/.prisma` and `node_modules/@prisma` directories to the restricted environment
3. Run the build

#### Option 2: Use Prisma Data Proxy (Recommended for Production)
1. Set up Prisma Accelerate or Data Proxy
2. Update `prisma/schema.prisma`:
   ```prisma
   generator client {
     provider = "prisma-client-js"
     previewFeatures = ["driverAdapters"]
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_DATABASE_URL") // Optional: for migrations
   }
   ```
3. Use the Data Proxy connection string

#### Option 3: Docker Build (Recommended for CI/CD)
Build in a Docker container with internet access:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build
```

#### Option 4: Pre-commit Hook
Add a pre-commit hook to generate Prisma client before committing:
```bash
#!/bin/sh
npx prisma generate
git add node_modules/.prisma node_modules/@prisma
```

### Current Status
The codebase has been configured with:
- Type stubs for Prisma Client to allow TypeScript compilation
- Runtime error handling in `lib/prisma.ts`
- Next.js configuration to handle missing Prisma engines gracefully

**IMPORTANT**: API routes requiring database access will not work until Prisma client is properly generated. The application will need engines at runtime.

## Other Fixed Issues

### 1. Next.js Config - Invalid Telemetry Key
**Fixed**: Removed the unsupported `telemetry` configuration key from `next.config.js` (not supported in Next.js 14.0.4)

### 2. ESLint Warning - useEffect Dependencies
**Fixed**: Added eslint-disable comment for `useEffect` in `app/dashboard/attendance/page.tsx` where functions are intentionally excluded from dependencies to prevent infinite re-renders.

## Testing Recommendations

Before deploying:
1. Ensure Prisma client is properly generated
2. Verify database connectivity with `npx prisma db pull`
3. Run migrations if needed: `npx prisma migrate deploy`
4. Test API routes: `/api/employees`, `/api/attendance`, etc.
5. Verify authentication flows

## Production Deployment Checklist

- [ ] Prisma client generated successfully
- [ ] Database connection string configured (`DATABASE_URL`)
- [ ] All environment variables set
- [ ] Migrations applied
- [ ] Build completes without errors
- [ ] API routes responding correctly
- [ ] Authentication working
