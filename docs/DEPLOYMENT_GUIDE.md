# 🚀 Deployment Guide: GMP Payroll System

This guide details how to deploy the GMP Payroll System to **Vercel**, the recommended platform for Next.js applications.

## 📋 Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Database**: A PostgreSQL database accessible from the internet.

---

## 🗄️ Step 1: Set up the Production Database

Since this is a payroll system, you need a reliable PostgreSQL database. We recommend **Vercel Postgres** or **Neon** for ease of use, or **Supabase**.

### Option A: Vercel Postgres (Recommended)
1.  Go to your Vercel Dashboard.
2.  Click **Storage** -> **Create Database** -> **Postgres**.
3.  Give it a name (e.g., `gmppayroll-db`) and region.
4.  Once created, Vercel will provide environment variables.

### Option B: External Postgres (Neon/Supabase/AWS)
1.  Create a database instance.
2.  Get the **Connection String** (Transaction Mode is preferred for serverless).
3.  It usually looks like: `postgres://user:pass@host:5432/db?sslmode=require`.

---

## ⚙️ Step 2: Configure Vercel Project

1.  Go to the Vercel Dashboard and click **"Add New..."** -> **"Project"**.
2.  Import your `gmppayroll-system` repository from GitHub.
3.  **Framework Preset**: Select `Next.js`.
4.  **Root Directory**: Leave as `./` (default).

### Environment Variables
Expand the **"Environment Variables"** section and add the following:

| Variable Name | Value / Description |
| :--- | :--- |
| `DATABASE_URL` | Your production PostgreSQL connection string. |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://your-app.vercel.app`). *Note: Vercel sets VERCEL_URL, but NextAuth needs this.* |
| `NEXTAUTH_SECRET` | A long random string (generate with `openssl rand -base64 32`). |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL` (if used in frontend). |

**Security Note**: Never commit these values to GitHub.

---

## 🚀 Step 3: Build & Deploy

1.  Click **"Deploy"**.
2.  Vercel will clone your repo, install dependencies, and run `next build`.
3.  **First Deployment Issue**: The first deployment might fail if the database schema is not synced.

### Fixing Database Schema (Migrations)
You need to apply your Prisma schema to the production database.

**Method A: Build Command Override (Easiest)**
In Vercel Project Settings -> **General** -> **Build & Development Settings**:
Change **Build Command** to:
```bash
npx prisma migrate deploy && next build
```
*This ensures migrations run every time you deploy.*

**Method B: Manual Migration (Local CLI)**
Run this from your local machine, pointing to the production DB:
```powershell
# Windows PowerShell
$env:DATABASE_URL="your_production_connection_string"; npx prisma migrate deploy
```

---

## 👤 Step 4: Create the First Admin User

Once deployed, the database is empty. You need an Admin user to log in.

1.  **Access Vercel Console**: Go to your deployment -> **Storage** -> **Query** (if using Vercel Postgres) or use a tool like pgAdmin.
2.  **Run SQL to Insert Admin**:
    *(Password needs to be hashed. For initial setup, you might want to use a script or a temporary signup page if enabled, but direct SQL is safer for closed systems.)*

    **Better Approach**: Use the `scripts/create-admin.ts` (if available) or a seed script.

    **Running Seed on Vercel**:
    Add `"postinstall": "prisma generate"` to `package.json` is standard.
    To seed, you can run a custom command or use the Vercel Console.

    **SQL Query for Emergency Admin**:
    ```sql
    INSERT INTO "User" ("id", "name", "email", "password", "role", "updatedAt")
    VALUES ('admin_id', 'Super Admin', 'admin@gmp.com', '$2b$10$EpRnTzVlqHNP0.fKbXTnLO90e.7j1...', 'SUPER_ADMIN', NOW());
    -- Note: Password must be a valid BCrypt hash. 
    -- The hash above is for 'password123' (example only, do not use in prod).
    ```

---

## 🔄 Step 5: Continuous Deployment

Now, every time you push to the `main` branch on GitHub:
1.  Vercel detects the change.
2.  It runs `npx prisma migrate deploy` (if configured).
3.  It builds the Next.js app.
4.  It promotes the new version to live.

## 🔍 Verification Checklist

- [ ] **Login Page**: Loads without error.
- [ ] **Authentication**: Can log in with the Admin user.
- [ ] **Dashboard**: Loads KPI cards (might be empty).
- [ ] **Leave/Attendance**: Pages load without 500 errors.

## 🆘 Troubleshooting

- **500 Internal Server Error**: Check Vercel **Logs** tab.
- **Database Connection Error**: Check `DATABASE_URL` in Env Vars. Ensure "Allow access from anywhere" is on for the DB (or whitelist Vercel IPs).
- **Auth Error**: Check `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.

