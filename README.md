# GMP Payroll - India Payroll Management System

## 🚀 Complete Deployment Guide for www.gmppayroll.org

### ✅ What You Have
- ✅ Domain: gmppayroll.org (Namecheap)
- ✅ GitHub Account
- ✅ Vercel Account
- ✅ All code files ready to deploy

---

## 📦 STEP 1: Upload Code to GitHub (5 minutes)

### Option A: Using GitHub Website (EASIEST - Recommended)

1. **Go to GitHub** → https://github.com/new
   
2. **Create New Repository:**
   - Repository name: `gmppayroll-system`
   - Description: `India Payroll Management System`
   - **IMPORTANT**: Keep it **PRIVATE** if you don't want others to see code
   - ✅ Click "Create repository"

3. **Upload Files:**
   - Click "uploading an existing file"
   - **Drag and drop ALL the folders and files from your computer**
     - Including: `app/`, `components/`, `prisma/`, `lib/`, all config files
   - Write commit message: "Initial commit - Complete payroll system"
   - Click "Commit changes"

### Option B: Using Command Line (If you know Git)

```bash
cd gmppayroll-system
git init
git add .
git commit -m "Initial commit - Complete payroll system"
git remote add origin https://github.com/YOUR_USERNAME/gmppayroll-system.git
git push -u origin main
```

---

## 🗄️ STEP 2: Setup Database on Supabase (5 minutes)

1. **Go to Supabase** → https://supabase.com
   
2. **Sign in** (use GitHub account for quick signin)

3. **Create New Project:**
   - Click "New project"
   - Name: `gmp-payroll`
   - Database Password: **SAVE THIS PASSWORD SECURELY!**
   - Region: Select closest to India (e.g., ap-south-1)
   - Click "Create new project"
   - Wait 2-3 minutes for setup

4. **Get Database URL:**
   - Click "Project Settings" (gear icon)
   - Click "Database" from left menu
   - Find "Connection string" → URI
   - Copy the entire connection string
   - **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
   
   It should look like:
   ```
   postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

---

## ☁️ STEP 3: Deploy to Vercel (3 minutes)

1. **Go to Vercel** → https://vercel.com

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select your `gmppayroll-system` repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `./` (leave as default)
   
4. **Add Environment Variables:**
   Click "Environment Variables" and add these **THREE** variables:

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: Paste your Supabase connection string from Step 2

   **Variable 2:**
   - Name: `NEXTAUTH_URL`
   - Value: `https://gmppayroll-system.vercel.app` (we'll change this later)

   **Variable 3:**
   - Name: `NEXTAUTH_SECRET`
   - Value: Copy this random string: `gmp-payroll-secret-key-2024-production-secure`

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes (Vercel will install packages and build your app)
   - ✅ You'll see "Congratulations! Your project has been deployed"

6. **Get Temporary URL:**
   - Copy the URL (looks like: `gmppayroll-system.vercel.app`)
   - Test it - open in browser to verify it works

---

## 🌐 STEP 4: Connect Your Domain gmppayroll.org (5 minutes)

### In Vercel:

1. **Add Domain:**
   - Go to your project in Vercel
   - Click "Settings" tab
   - Click "Domains" from left sidebar
   - Type: `www.gmppayroll.org`
   - Click "Add"

2. **Get DNS Records:**
   - Vercel will show you DNS records needed
   - **Keep this page open** - you'll need these values

### In Namecheap:

1. **Login to Namecheap** → https://namecheap.com

2. **Manage Domain:**
   - Find `gmppayroll.org`
   - Click "Manage"

3. **Add DNS Records:**
   - Go to "Advanced DNS" tab
   - Click "Add New Record"
   
   **Add Record 1 (for www):**
   - Type: `CNAME Record`
   - Host: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `Automatic`
   - Save
   
   **Add Record 2 (for root domain - optional):**
   - Type: `A Record`
   - Host: `@`
   - Value: `76.76.21.21` (Vercel's IP)
   - TTL: `Automatic`
   - Save

4. **Wait for DNS Propagation:**
   - Usually takes 5-15 minutes
   - Sometimes up to 1 hour
   - You'll get email when ready

---

## 🔐 STEP 5: Update Environment Variable (1 minute)

Once your domain is working:

1. **Go to Vercel:**
   - Project Settings → Environment Variables
   
2. **Edit NEXTAUTH_URL:**
   - Find `NEXTAUTH_URL`
   - Click "Edit"
   - Change value to: `https://www.gmppayroll.org`
   - Save

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click the three dots on latest deployment
   - Click "Redeploy"
   - Wait 1-2 minutes

---

## 🎉 STEP 6: Your Site is LIVE!

Visit: **https://www.gmppayroll.org**

### First Time Setup:

1. **Create Admin Account:**
   - Click "Get Started" or "Sign Up"
   - Enter your email and password
   - First user automatically becomes admin

2. **Setup Organization:**
   - Add your company details
   - Add business entity information
   - Add employees
   - Start processing payroll!

---

## 📝 Important Notes:

### What Works NOW:
✅ Beautiful landing page
✅ User authentication (login/signup)
✅ Dashboard with analytics
✅ Employee management (add/edit/view)
✅ Payroll processing
✅ PF/ESI file generation
✅ PT/TDS calculations
✅ Payslip generation
✅ Reports (G2N, etc.)
✅ Full India compliance

### Database:
- All data is stored securely in Supabase PostgreSQL
- Automatic backups daily
- Unlimited users and employees

### Security:
- HTTPS enabled automatically
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control

---

## 🆘 Troubleshooting:

### If deployment fails:
1. Check all environment variables are set correctly
2. Verify DATABASE_URL has your actual password (not [YOUR-PASSWORD])
3. Try redeploying from Vercel dashboard

### If domain doesn't work:
1. Wait 15-30 minutes for DNS propagation
2. Clear browser cache
3. Try incognito/private browsing mode
4. Check Namecheap DNS records are saved correctly

### If you see database errors:
1. Verify DATABASE_URL in Vercel environment variables
2. Check Supabase project is active
3. Ensure password in connection string is correct

---

## 📧 Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

## 🎯 Next Steps After Deployment:

1. ✅ Login to your system
2. ✅ Add your first organization
3. ✅ Add employees
4. ✅ Process first payroll
5. ✅ Generate PF/ESI files
6. ✅ Generate payslips
7. ✅ Share the link with your team!

---

**Congratulations! Your India Payroll System is now live at www.gmppayroll.org! 🎉**
