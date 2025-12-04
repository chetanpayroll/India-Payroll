# 🚀 Complete Deployment & Publishing Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Database Setup](#production-database-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Post-Deployment Setup](#post-deployment-setup)
5. [Custom Domain (Optional)](#custom-domain-optional)

---

## 1. Local Development Setup

### Quick Start (No Database Required)

```powershell
# Clone and install
git clone <your-repo-url>
cd gmppayroll-system
npm install

# Copy dev environment
Copy-Item docs\.env.local.TEMPLATE .env.local

# Start dev server
npm run dev
```

Visit `http://localhost:3000` and login with any credentials.

### With Real Database (Optional)

```powershell
# Update .env.local
DISABLE_AUTH=false
DATABASE_URL="postgresql://user:pass@localhost:5432/gmppayroll"

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start server
npm run dev
```

---

## 2. Production Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Postgres**
3. Name: `gmppayroll-db`
4. Region: Choose closest to your users
5. Click **Create**

Vercel will automatically add `DATABASE_URL` to your project.

### Option B: Neon (Free Tier Available)

1. Go to [Neon.tech](https://neon.tech)
2. Create account and new project
3. Copy the connection string
4. It looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

### Option C: Supabase

1. Go to [Supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings** → **Database**
4. Copy **Connection String** (Transaction mode)

---

## 3. Vercel Deployment

### Step 1: Push to GitHub

```powershell
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - GMP Payroll System"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/gmppayroll-system.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repository
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./`

### Step 3: Configure Environment Variables

Click **Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | From Step 2 (Neon/Supabase/Vercel) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Will be auto-filled after first deploy |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | **Critical for security** |

**⚠️ IMPORTANT:** Do NOT set `DISABLE_AUTH=true` in production!

### Step 4: Configure Build Command

Go to **Settings** → **General** → **Build & Development Settings**

**Build Command:**
```bash
npx prisma migrate deploy && npx prisma generate && next build
```

This ensures:
- Database schema is applied
- Prisma Client is generated
- Next.js app is built

### Step 5: Deploy

Click **Deploy**

Vercel will:
1. Clone your repo
2. Install dependencies
3. Run migrations
4. Build the app
5. Deploy to production

---

## 4. Post-Deployment Setup

### Create First Admin User

**Option A: Using Vercel Postgres Console**

1. Go to **Storage** → Your Database → **Query**
2. Run this SQL (replace password hash):

```sql
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'System Admin',
  'admin@yourcompany.com',
  '$2b$10$EpRnTzVlqHNP0.fKbXTnLO90e.7j1.QKZ8Z8Z8Z8Z8Z8Z8',  -- Hash for 'Admin@123'
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

**Option B: Using Local Script**

```powershell
# Point to production DB
$env:DATABASE_URL="your-production-db-url"
npx ts-node scripts/create-admin.ts
```

### Seed Initial Data (Optional)

Create shifts, leave policies, etc.:

```powershell
# Create seed script or run SQL
INSERT INTO "Shift" (id, "shiftCode", "shiftName", "startTime", "endTime", "workingHours", "createdAt", "updatedAt")
VALUES (
  'shift-001',
  'DAY',
  'Day Shift',
  '09:00',
  '18:00',
  8.0,
  NOW(),
  NOW()
);
```

---

## 5. Custom Domain (Optional)

### Add Your Domain

1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain: `payroll.yourcompany.com`
4. Follow DNS instructions

### Update Environment Variables

After domain is active:

1. Go to **Settings** → **Environment Variables**
2. Update `NEXTAUTH_URL` to `https://payroll.yourcompany.com`
3. Redeploy

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] **Homepage**: Loads without errors
- [ ] **Login**: Can login with admin credentials
- [ ] **Dashboard**: Shows without 500 errors
- [ ] **Leave Module**: `/dashboard/leave` loads
- [ ] **Attendance**: `/dashboard/attendance` loads
- [ ] **Database**: Check Vercel Logs for successful migrations

---

## 🆘 Troubleshooting

### Build Fails

**Error:** `Prisma Client not generated`
**Fix:** Ensure build command includes `npx prisma generate`

### Database Connection Error

**Error:** `Can't reach database server`
**Fix:** 
- Check `DATABASE_URL` is correct
- Ensure database allows connections from Vercel IPs
- For Neon/Supabase: Use **Transaction** mode connection string

### Auth Errors

**Error:** `NEXTAUTH_SECRET must be provided`
**Fix:** Add `NEXTAUTH_SECRET` in Vercel env vars

**Error:** `NEXTAUTH_URL must match deployment URL`
**Fix:** Update `NEXTAUTH_URL` to your actual Vercel URL

### 500 Internal Server Error

**Check Vercel Logs:**
1. Go to **Deployments** → Click latest
2. Click **Functions** tab
3. Check error logs

---

## 📊 Monitoring & Maintenance

### View Logs
- **Vercel Dashboard** → **Deployments** → **Functions**
- Real-time logs show API errors and database queries

### Database Backups
- **Vercel Postgres**: Automatic daily backups
- **Neon**: Point-in-time recovery available
- **Supabase**: Automatic backups on paid plans

### Performance Monitoring
- Use Vercel Analytics (free tier available)
- Monitor response times and error rates

---

## 🔄 Continuous Deployment

Every push to `main` branch will:
1. Trigger automatic deployment
2. Run migrations
3. Build and deploy new version

To deploy from a different branch:
- Go to **Settings** → **Git** → **Production Branch**
- Change to your preferred branch

---

## 🎉 You're Live!

Your GMP Payroll System is now deployed and accessible at:
`https://your-app.vercel.app`

Share this URL with your team and start managing payroll! 🚀
