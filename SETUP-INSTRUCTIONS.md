# 🚀 Login Fix Instructions

## The Problem
You can't login because the Supabase database doesn't have the required tables yet.

## The Solution - Two Options:

---

### Option 1: Setup Supabase (For Deployed/Production Site) ⭐ RECOMMENDED

If you're accessing your site deployed on **Vercel**, follow these steps:

#### Step 1: Login to Supabase
1. Go to https://supabase.com
2. Login to your account
3. Open your `gmp-payroll` project

#### Step 2: Run the Setup SQL
1. Click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy ALL content from the file: `setup-supabase.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Database setup complete!" message

#### Step 3: Test Your Login
1. Go to your deployed site (e.g., https://gmppayroll-system.vercel.app/auth/login)
2. Enter **ANY email** (e.g., admin@test.com)
3. Enter **ANY password** (e.g., 123)
4. Click **Sign In**
5. ✅ You should be logged in!

---

### Option 2: Run Locally (For Testing on Your Computer)

If you want to test on your local machine:

#### Prerequisites:
- PostgreSQL installed
- Node.js installed

#### Steps:
1. Start PostgreSQL service
2. Copy `.env.example` to `.env`
3. Update DATABASE_URL in `.env`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gmp_payroll"
   ```
4. Run: `npm install`
5. Create database: `createdb gmp_payroll`
6. Run the SQL script:
   ```bash
   psql -d gmp_payroll -f setup-supabase.sql
   ```
7. Start server: `npm run dev`
8. Open: http://localhost:3000/auth/login
9. Login with ANY email/password

---

## How It Works Now

✅ **Universal Login** - Accepts ANY email and password
✅ **Auto-Registration** - Creates user account on first login
✅ **Demo Mode** - Perfect for testing and demonstrations
✅ **Admin Role** - All users get admin role by default

---

## Troubleshooting

### Error: "Database connection failed"
- ✅ Check DATABASE_URL in Vercel environment variables
- ✅ Make sure Supabase project is active
- ✅ Verify you ran the setup-supabase.sql script

### Error: "Table does not exist"
- ✅ Run the setup-supabase.sql script in Supabase SQL Editor

### Still not working?
1. Check browser console for errors (F12)
2. Verify Vercel deployment logs
3. Check Supabase logs in the dashboard

---

## Environment Variables Checklist

Make sure these are set in **Vercel** (or `.env` for local):

```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.xxxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR_PASSWORD]@db.xxxxx.supabase.co:5432/postgres
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
ENABLE_REAL_AUTH=false
```

**IMPORTANT:** Replace `[YOUR_PASSWORD]` and other placeholders with actual values!

---

## Need More Help?

Check:
- Vercel deployment logs
- Supabase project logs
- Browser console (F12 → Console tab)

Share any error messages you see for more specific help.
