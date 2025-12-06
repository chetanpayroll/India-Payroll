# 🚀 PayrollNexus-India: Complete Setup & Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Project Scaffolding](#project-scaffolding)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

| Software | Minimum Version | Download Link |
|----------|----------------|---------------|
| **Node.js** | 18.0.0+ | https://nodejs.org/ |
| **npm** | 9.0.0+ (comes with Node.js) | - |
| **Docker Desktop** | 20.0.0+ | https://www.docker.com/products/docker-desktop |
| **Git** | 2.0.0+ | https://git-scm.com/ |

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 9.0.0 or higher

# Check Docker version
docker --version  # Should be 20.0.0 or higher
docker-compose --version

# Check Git version
git --version
```

---

## 🏗️ Local Development Setup

### Step 1: Project Initialization

```bash
# Navigate to your project directory
cd c:\Users\Dell\OneDrive\Documents\India-Payroll

# Initialize git repository (if not already done)
git init

# Create .gitignore
cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.production

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# Uploads
uploads/
temp/
EOL
```

### Step 2: Copy Configuration Files

```bash
# Copy environment configuration
cp scripts/.env.example .env

# Copy Docker Compose
cp scripts/docker-compose.yml .

# The Prisma schema is already in place
# prisma/schema.prisma ✅
```

### Step 3: Create Backend Structure

```bash
# Create backend directory structure
mkdir -p backend/src/modules
mkdir -p backend/src/core/database
mkdir -p backend/src/core/formula-engine
mkdir -p backend/src/core/guards
mkdir -p backend/src/core/interceptors
mkdir -p backend/src/common/decorators
mkdir -p backend/src/common/dto
mkdir -p backend/test

# Copy backend package.json
cp scripts/backend-package.json backend/package.json

# Move Prisma schema
cp prisma/schema.prisma backend/prisma/schema.prisma
```

### Step 4: Create Frontend Structure

```bash
# Create frontend directory structure
mkdir -p frontend/app/\(auth\)/login
mkdir -p frontend/app/\(dashboard\)
mkdir -p frontend/components/ui
mkdir -p frontend/components/layout
mkdir -p frontend/components/pay-elements
mkdir -p frontend/lib/api
mkdir -p frontend/lib/stores
mkdir -p frontend/public
```

### Step 5: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Generate Prisma Client
npx prisma generate

# Go back to root
cd ..

# Install frontend dependencies
cd frontend
npm install

# Go back to root
cd ..
```

---

## 🐳 Docker Setup

### Step 1: Start Docker Services

```bash
# Start all services (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

Expected output:
```
NAME                    STATUS              PORTS
payrollnexus-db        Up (healthy)        0.0.0.0:5432->5432/tcp
payrollnexus-redis     Up (healthy)        0.0.0.0:6379->6379/tcp
payrollnexus-api       Up                  0.0.0.0:3000->3000/tcp
payrollnexus-web       Up                  0.0.0.0:3001->3000/tcp
```

### Step 2: Verify Services

```bash
# Test PostgreSQL connection
docker-compose exec postgres psql -U payroll_user -d payrollnexus -c "\dt"

# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG
```

---

## 💾 Database Setup

### Step 1: Run Migrations

```bash
# From project root
docker-compose exec backend npx prisma migrate dev --name init

# Or if not using Docker:
cd backend
npx prisma migrate dev --name init
```

This creates all tables defined in `prisma/schema.prisma`.

### Step 2: Seed Database

Create `backend/prisma/seed.ts` (see PAYROLLNEXUS_COMPLETE_GUIDE.md for full code):

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create vendor
  const vendor = await prisma.vendor.create({
    data: {
      name: 'PayrollNexus Demo Vendor',
      code: 'PNDEMO',
      contactEmail: 'admin@payrollnexus.demo',
      status: 'ACTIVE',
    },
  });

  // ... (full seed code in guide)

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:

```bash
docker-compose exec backend npx prisma db seed

# Or without Docker:
cd backend
npx prisma db seed
```

### Step 3: Verify Data

```bash
# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Or start with profile
docker-compose --profile tools up prisma-studio -d

# Access: http://localhost:5555
```

---

## 🏃 Running the Application

### Option 1: Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Database (if not using Docker):**
```bash
# You'll need to install and run PostgreSQL & Redis locally
# Not recommended - use Docker instead
```

---

## 🌐 Access the Application

Once running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | Any email + any password |
| **Backend API** | http://localhost:3000/api/v1 | - |
| **API Docs (Swagger)** | http://localhost:3000/api/docs | - |
| **Prisma Studio** | http://localhost:5555 | - |

### First Login

```
Email: demo@payrollnexus.com
Password: anything
```

Or try:
```
Email: john@example.com
Password: test123
```

Both will work! 🔓

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Watch mode
npm run test:watch
```

### Manual Testing Checklist

- [ ] Login with any email/password
- [ ] Create a client organization
- [ ] Create an entity
- [ ] Add employees (single & bulk)
- [ ] Configure pay elements
- [ ] Set up statutory configs
- [ ] Create payroll run
- [ ] Calculate payroll
- [ ] Approve payroll
- [ ] Generate payslips
- [ ] View audit logs

---

## 🚀 Production Deployment

### Step 1: Production Environment Setup

Create `.env.production`:

```bash
# Database (managed service recommended)
DATABASE_URL="postgresql://user:password@your-db-host:5432/payrollnexus?sslmode=require"

# Redis (managed service recommended)
REDIS_URL="rediss://:password@your-redis-host:6379"

# JWT (generate strong secrets)
JWT_SECRET="USE-A-STRONG-RANDOM-SECRET-HERE"

# Application
NODE_ENV="production"
PORT=3000
CORS_ORIGIN="https://your-frontend-domain.com"

# Frontend
NEXT_PUBLIC_API_URL="https://your-api-domain.com/api/v1"

# Disable development tools
SWAGGER_ENABLED=false
LOG_LEVEL="warn"
```

### Step 2: Build for Production

```bash
# Backend build
cd backend
npm run build

# Frontend build
cd frontend
npm run build
```

### Step 3: Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: payrollnexus-api-prod
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    command: npm run start:prod
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: payrollnexus-web-prod
    env_file:
      - .env.production
    ports:
      - "3001:3000"
    command: npm run start
    restart: always
```

### Step 4: Database Migrations

```bash
# Run migrations in production
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Step 5: Deploy

**Option A: VPS/EC2**
```bash
# SSH into server
ssh user@your-server.com

# Pull latest code
git pull origin main

# Build and run
docker-compose -f docker-compose.prod.yml up -d --build
```

**Option B: Cloud Platforms**

**Vercel (Frontend)**
```bash
cd frontend
vercel --prod
```

**Railway/Render (Backend)**
- Connect your GitHub repository
- Set environment variables
- Deploy

**Database**
- Use managed PostgreSQL (AWS RDS, Digital Ocean, Railway)
- Enable SSL connections
- Set up automated backups

---

## 🔧 Troubleshooting

### Issue: Docker containers won't start

**Solution:**
```bash
# Check Docker is running
docker ps

# Check logs
docker-compose logs

# Remove and recreate
docker-compose down -v
docker-compose up -d --build
```

### Issue: Database connection error

**Solution:**
```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U payroll_user -d payrollnexus
```

### Issue: Prisma client not found

**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env
```

### Issue: Frontend can't connect to backend

**Solution:**
```bash
# Check NEXT_PUBLIC_API_URL in .env
# Ensure backend is running
curl http://localhost:3000/api/v1/health

# Check CORS settings
```

---

## 📊 Production Checklist

Before going live:

- [ ] Change all default secrets (JWT_SECRET, ENCRYPTION_KEY)
- [ ] Use managed database with automated backups
- [ ] Enable SSL/TLS for all connections
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure rate limiting
- [ ] Set up CDN for static assets
- [ ] Enable database connection pooling
- [ ] Implement proper logging
- [ ] Set up automated backups
- [ ] Configure CI/CD pipeline
- [ ] Perform load testing
- [ ] Set up alerting
- [ ] Document runbooks
- [ ] Plan disaster recovery

---

## 🎯 Performance Optimization

### Database Indexing

All critical indexes are already in the Prisma schema:
- `@@index([vendorId])` on clients
- `@@index([clientId])` on employees
- `@@index([payrollRunId])` on line items

### Caching Strategy

```typescript
// Implement Redis caching for:
- User sessions
- Statutory configurations
- Pay element definitions
- Dashboard statistics
```

### Query Optimization

```typescript
// Use Prisma select/include wisely
const employees = await prisma.employee.findMany({
  select: {
    id: true,
    name: true,
    employeeCode: true,
  },
  where: { status: 'ACTIVE' },
});
```

---

## 📝 Maintenance Tasks

### Daily
- Check error logs
- Monitor API response times
- Verify backup completion

### Weekly
- Review audit logs
- Check database size
- Update dependencies (minor versions)

### Monthly
- Database optimization (VACUUM, ANALYZE)
- Review and rotate secrets
- Security patch updates
- Capacity planning review

---

## 🆘 Getting Help

1. **Documentation**: Check `docs/` folder
2. **Logs**: `docker-compose logs -f`
3. **Database**: Prisma Studio at http://localhost:5555
4. **API**: Swagger docs at http://localhost:3000/api/docs

---

## ✅ Success Indicators

Your deployment is successful when:

1. ✅ All Docker containers show "healthy" status
2. ✅ Can login to frontend with any email/password
3. ✅ Can create vendor, client, entity
4. ✅ Can add employees
5. ✅ Can configure pay elements
6. ✅ Can run payroll calculation
7. ✅ Can generate payslips
8. ✅ Audit logs are recording all actions
9. ✅ No errors in console logs
10. ✅ API responses are under 200ms

---

<div align="center">

**🎉 Congratulations! Your PayrollNexus-India system is ready!**

For detailed implementation, see:
- [Complete Backend Guide](./PAYROLLNEXUS_COMPLETE_GUIDE.md)
- [Complete Frontend Guide](./PAYROLLNEXUS_FRONTEND_GUIDE.md)

</div>
