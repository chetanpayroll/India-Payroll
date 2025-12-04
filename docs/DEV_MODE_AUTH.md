# 🚧 Dev Mode - Auth Disabled

## Quick Setup for Local Development

This feature allows you to run the app locally **without a database** and **without real authentication**.

### How to Enable

1. **Copy the template:**
   ```powershell
   Copy-Item docs\.env.local.TEMPLATE .env.local
   ```

2. **Verify `.env.local` contains:**
   ```env
   DISABLE_AUTH=true
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=dev-secret-change-in-production
   ```

3. **Start the dev server:**
   ```powershell
   npm run dev
   ```

### What Happens

- ✅ **Login Page**: Any email + any password will work
- ✅ **Mock User**: You'll be logged in as "Dev User" with ADMIN role
- ✅ **All Routes**: `/dashboard`, `/dashboard/attendance`, `/dashboard/leave`, etc. are accessible
- ✅ **No Database**: The auth flow doesn't require `DATABASE_URL`

### Testing

1. Go to `http://localhost:3000/auth/login`
2. Enter:
   - Email: `test@example.com` (or anything)
   - Password: `password` (or anything)
3. Click Login
4. You'll be redirected to `/dashboard` as an Admin

### Disabling Dev Mode (Production)

To use real authentication:

1. **Remove or set to false:**
   ```env
   DISABLE_AUTH=false
   ```

2. **Add real credentials:**
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   ```

3. **Restart the server**

### Security Notes

- ⚠️ **Never deploy with `DISABLE_AUTH=true`**
- ⚠️ This flag is for local development only
- ⚠️ Vercel deployments should NOT have this env var set

---

## Implementation Details

### Files Modified

1. **`lib/auth.ts`**
   - Checks `DISABLE_AUTH` flag
   - Returns mock user when enabled
   - Skips Prisma/bcrypt when enabled

2. **`middleware.ts`**
   - Bypasses all auth checks when `DISABLE_AUTH=true`
   - Allows access to all protected routes

### Code Snippets

**Auth Check:**
```typescript
const disableAuth = process.env.DISABLE_AUTH === "true";

if (disableAuth) {
  return {
    id: "dev-user",
    name: credentials?.email || "Dev User",
    email: credentials?.email || "dev@example.com",
    role: "ADMIN",
  };
}
```

**Middleware Bypass:**
```typescript
if (disableAuth) {
  return NextResponse.next()
}
```
