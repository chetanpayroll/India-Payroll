# ⚡ QUICK START GUIDE

## 🎯 Goal
Get www.gmppayroll.org live in 25 minutes!

---

## ✅ PRE-FLIGHT CHECK

Do you have these? Check each box:
- [ ] GitHub account (https://github.com/signup)
- [ ] Vercel account (https://vercel.com/signup)
- [ ] Supabase account (https://supabase.com)
- [ ] gmppayroll.org domain on Namecheap (purchased)
- [ ] All project files downloaded

**Missing something?** Get it now before proceeding!

---

## 🚀 THE 4-STEP PROCESS

### STEP 1: GITHUB (5 minutes) ⏱️

**Option A - Using GitHub Website (Easiest):**
1. Go to: https://github.com/new
2. Name: `gmppayroll-system`
3. Make it Private
4. Create repository
5. Click "uploading an existing file"
6. Drag ALL your folders and files
7. Write: "Initial commit"
8. Click "Commit changes"

✅ **Done!** Your code is on GitHub.

---

### STEP 2: DATABASE (5 minutes) ⏱️

1. Go to: https://supabase.com
2. Sign in with GitHub
3. Click "New project"
4. Fill in:
   - Name: `gmp-payroll`
   - Password: **Make a strong one and SAVE IT!**
   - Region: Singapore
5. Wait 2 minutes for setup
6. Go to: Settings → Database
7. Copy the "URI" connection string
8. Replace `[YOUR-PASSWORD]` with your password

**Save this URL!** You need it in Step 3.

Example:
```
postgresql://postgres.abc:MyPassword123@xxx.supabase.co:6543/postgres
```

✅ **Done!** Database is ready.

---

### STEP 3: DEPLOY (5 minutes) ⏱️

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select `gmppayroll-system`
5. Click "Import"

**Add Environment Variables:**

Click "Environment Variables" and add these 3:

```
Name: DATABASE_URL
Value: [Your Supabase URL from Step 2]

Name: NEXTAUTH_URL
Value: https://gmppayroll-system.vercel.app

Name: NEXTAUTH_SECRET
Value: gmp-payroll-secret-2024-production-secure
```

6. Click "Deploy"
7. Wait 2-3 minutes ☕
8. Click "Visit" to see your site!

✅ **Done!** Your site is live on Vercel!

---

### STEP 4: CUSTOM DOMAIN (10 minutes) ⏱️

**In Vercel:**
1. Go to Settings → Domains
2. Type: `www.gmppayroll.org`
3. Click "Add"

**In Namecheap:**
1. Login to Namecheap
2. Find `gmppayroll.org` → Manage
3. Go to "Advanced DNS"
4. Add these records:

**Record 1:**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

**Record 2:**
```
Type: A
Host: @
Value: 76.76.21.21
```

5. Save all changes
6. Wait 15-30 minutes for DNS ⏰

**After DNS works:**
1. Back to Vercel → Settings → Environment Variables
2. Edit `NEXTAUTH_URL`
3. Change to: `https://www.gmppayroll.org`
4. Save
5. Go to Deployments → Redeploy latest

✅ **DONE!** Your site is live at www.gmppayroll.org! 🎉

---

## 🎊 YOU'RE LIVE!

Visit: **https://www.gmppayroll.org**

### What Works Now:
✅ Beautiful landing page
✅ Login (use any email/password for demo)
✅ Full dashboard
✅ Employee management
✅ Payroll tracking
✅ Professional design
✅ Mobile responsive

---

## 🎬 FIRST LOGIN

1. Go to www.gmppayroll.org
2. Click "Get Started"
3. Enter any email and password (demo mode)
4. Explore the dashboard!

---

## 📱 SHARE WITH OTHERS

Send them:
"Check out our new payroll system: www.gmppayroll.org"

They can:
- View the homepage
- Login with any credentials (demo)
- See all features
- Test on mobile

---

## ❓ STUCK?

Check these files:
1. `DEPLOYMENT-CHECKLIST.md` - Detailed steps
2. `PROJECT-SUMMARY.md` - Everything explained
3. `README.md` - Full documentation

**Common Issues:**
- Build failed? → Check environment variables are correct
- Domain not working? → Wait longer (DNS takes time)
- Database error? → Verify password in DATABASE_URL

---

## 🎯 TOTAL TIME

| Step | Time |
|------|------|
| GitHub | 5 min |
| Database | 5 min |
| Deploy | 5 min |
| Domain | 10 min |
| **TOTAL** | **25 min** |

---

**YOU CAN DO THIS! Follow the steps and you'll have your site live in 25 minutes!** 🚀

**Start with STEP 1 now!** ⬆️
