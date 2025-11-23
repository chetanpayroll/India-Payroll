# Vercel Deployment Guide

## Environment Variables Required

To successfully deploy this application on Vercel, you need to set up the following environment variables in your Vercel project settings:

### Required Variables

1. **DATABASE_URL**
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
   ```
   - Get this from your PostgreSQL database provider (e.g., Neon, Supabase, Railway)
   - This MUST be set in Vercel environment variables

2. **NEXTAUTH_URL**
   ```
   https://your-vercel-domain.vercel.app
   ```
   - Set this to your Vercel deployment URL
   - For production, use your custom domain if you have one

3. **NEXTAUTH_SECRET**
   ```
   your-random-secret-key-min-32-characters
   ```
   - Generate a secure random string
   - You can use: `openssl rand -base64 32`
   - Keep this secret and never commit it to git

## Deployment Steps

### 1. Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all required variables above
4. Make sure to set them for Production, Preview, and Development environments

### 2. Database Setup

Ensure your PostgreSQL database is accessible from Vercel:
- Use a cloud-hosted PostgreSQL database (Neon, Supabase, Railway, etc.)
- Ensure the database allows connections from Vercel's IP ranges
- Run migrations before deploying:
  ```bash
  npx prisma migrate deploy
  ```

### 3. Deploy

Once environment variables are set:
1. Push your code to GitHub
2. Vercel will automatically deploy
3. The deployment should now succeed with "Ready" status

## Common Issues

### Issue: "Error" Status in Deployment

**Causes:**
- Missing DATABASE_URL environment variable
- Prisma engine download failures
- Build errors

**Solutions:**
- Verify all environment variables are set in Vercel
- Check build logs in Vercel dashboard
- Ensure DATABASE_URL is accessible

### Issue: "Building" Status for Too Long

**Causes:**
- Slow database connection during build
- Large dependencies being installed

**Solutions:**
- Use a fast, cloud-hosted database
- Check Vercel build logs for specific errors
- Ensure build command completes successfully

### Issue: Prisma Client Generation Fails

**Solutions:**
- Ensure Prisma version is compatible (using 5.22.0)
- Check that `prisma generate` runs successfully
- Verify DATABASE_URL format is correct

## Build Configuration

The project uses the following build configuration:

**vercel.json:**
```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs"
}
```

**package.json scripts:**
```json
{
  "build": "prisma generate && next build",
  "postinstall": "prisma generate || echo 'Prisma generate failed, continuing...'"
}
```

## Verifying Deployment

After deployment:
1. Check deployment status shows "Ready" (green)
2. Visit your deployment URL
3. Verify the application loads correctly
4. Test database connectivity through the app

## Support

If you continue to experience deployment issues:
1. Check Vercel build logs for specific errors
2. Verify all environment variables are correctly set
3. Ensure database is accessible and migrations are applied
4. Check Prisma schema is valid: `npx prisma validate`
