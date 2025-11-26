# 🚀 GMP Payroll System - Setup Guide

## Why You're Seeing "Failed Deployments"

The application requires a database to be set up before it can run. Currently:
- ❌ Database file doesn't exist (`prisma/dev.db`)
- ❌ Database tables haven't been created
- ❌ No seed data for testing

## ✅ Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
npm install -D tsx
```

### Step 2: Set Up Database

**Option A: Using Prisma Migrate (Recommended)**
```bash
npx prisma migrate dev --name init
```

If this fails with a 403 error, use Option B:

**Option B: Using Prisma Push (Works anywhere)**
```bash
npx prisma db push
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Seed Test Data
```bash
npm run db:seed
```

Expected output:
```
✅ Created employees: EMP001, EMP002
✅ Created leave balances for year: 2025
✅ Created sample leave request
🎉 Database seeded successfully!
```

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Test Leave Balance Feature
1. Open: http://localhost:3000
2. Go to: Dashboard → Leave Management
3. In "Employee Leave Balance" section, select "John Doe (EMP001)"
4. You should see:
   - Annual Leave: 30 days available
   - Sick Leave: 15 days available

---

## 🐛 Troubleshooting

### Error: "Failed to fetch engine file - 403 Forbidden"

This happens in restricted network environments. Solutions:

**1. Use Prisma Binary Targets**

Add to `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

Then:
```bash
npx prisma generate
```

**2. Use Cached Engines**

If you have another machine with Prisma working:
```bash
# On working machine
npm run postinstall
tar -czf prisma-engines.tar.gz node_modules/.prisma

# Transfer file, then on this machine
tar -xzf prisma-engines.tar.gz
```

**3. Use Environment Variable**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push
```

### Error: "PrismaClient is unable to run in the browser"

This means you're trying to use Prisma in client-side code. The leave balance feature uses API routes (server-side), so this shouldn't happen. If it does:
- Check that you're not importing `@prisma/client` in any `.tsx` files under `/app/dashboard/`
- All database calls should be in `/app/api/` routes

### Error: "No such table: Employee"

Database hasn't been created. Run:
```bash
npx prisma db push
npm run db:seed
```

### Error: "Employee not found" or Empty Dropdown

No employees in database. Run:
```bash
npm run db:seed
```

---

## 📊 What Gets Created

### Database Structure
- **File**: `prisma/dev.db` (SQLite database)
- **Size**: ~100KB with seed data
- **Tables**: 30+ tables for payroll management

### Seed Data
- **2 Employees**:
  - John Doe (EMP001) - Software Engineer
  - Sarah Smith (EMP002) - HR Manager

- **2 Leave Balances** (Year 2025):
  - John: 30 annual + 15 sick days
  - Sarah: 28 annual (5 taken) + 13 sick (2 taken)

- **1 Leave Request**:
  - Pending request for John Doe

---

## 🔐 Database GUI (Optional)

To view/edit data visually:
```bash
npx prisma studio
```

Opens at: http://localhost:5555

---

## 🌐 Deployment to Production

### Vercel
1. Add environment variable:
   ```
   DATABASE_URL=file:./prisma/dev.db
   ```

2. Add to `vercel.json`:
   ```json
   {
     "buildCommand": "npx prisma generate && npm run build"
   }
   ```

**Note**: SQLite doesn't work well on Vercel (read-only filesystem). For production, use:
- **PostgreSQL** (recommended): Vercel Postgres, Supabase, Railway
- **MySQL**: PlanetScale, Railway
- **MongoDB**: MongoDB Atlas

### Switching to PostgreSQL for Production

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `npm run dev` starts without errors
- [ ] Navigate to http://localhost:3000
- [ ] Dashboard loads
- [ ] Leave Management page loads
- [ ] Employee dropdown shows 2 employees
- [ ] Selecting employee shows leave balance
- [ ] Leave statistics show 1 pending request
- [ ] Can create new leave request
- [ ] Can approve/reject leave requests

---

## 📞 Need Help?

If you're still stuck:

1. **Check the logs**: Look for error messages in terminal
2. **Check browser console**: F12 → Console tab
3. **Verify database**: Run `npx prisma studio` to see if data exists
4. **Reset everything**:
   ```bash
   rm -rf node_modules package-lock.json prisma/dev.db
   npm install
   npx prisma db push
   npm run db:seed
   npm run dev
   ```

---

## 🎯 Quick Reference

```bash
# Full reset
npm run db:reset

# Seed data only
npm run db:seed

# Database GUI
npx prisma studio

# Check schema
npx prisma format

# Validate schema
npx prisma validate
```
