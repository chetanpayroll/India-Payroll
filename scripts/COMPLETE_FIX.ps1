# ================================================================
# ENTERPRISE PAYROLL SYSTEM - COMPLETE FIX SCRIPT
# Next.js 14 + NextAuth v4 + Prisma 5 + React 18
# ================================================================

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GMP PAYROLL SYSTEM - ENTERPRISE FIX PROTOCOL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

# Verify we're in the correct directory
$projectRoot = "C:\Users\Dell\OneDrive\Documents\GitHub\gmppayroll-system"
if ((Get-Location).Path -ne $projectRoot) {
    Write-Host "⚠️  Changing to project root..." -ForegroundColor Yellow
    Set-Location $projectRoot
}

Write-Host "`n[PHASE 1] Dependency Cleanup" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

# Complete cleanup
Write-Host "  → Removing node_modules..." -ForegroundColor White
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}

Write-Host "  → Removing package-lock.json..." -ForegroundColor White
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
}

Write-Host "  → Removing .next build cache..." -ForegroundColor White
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}

Write-Host "  → Clearing npm cache..." -ForegroundColor White
npm cache clean --force 2>&1 | Out-Null

Write-Host "`n[PHASE 2] Core Framework Installation" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "  → Installing Next.js 14.0.4..." -ForegroundColor White
npm install next@14.0.4

Write-Host "  → Installing React 18.3.1..." -ForegroundColor White
npm install react@18.3.1 react-dom@18.3.1

Write-Host "`n[PHASE 3] Authentication Stack" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "  → Installing NextAuth v4.24.7..." -ForegroundColor White
npm install next-auth@4.24.7

Write-Host "  → Installing bcryptjs..." -ForegroundColor White
npm install bcryptjs@2.4.3

Write-Host "`n[PHASE 4] Database Layer" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "  → Installing Prisma 5.22.0..." -ForegroundColor White
npm install @prisma/client@5.22.0
npm install -D prisma@5.22.0

Write-Host "`n[PHASE 5] TypeScript Definitions" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "  → Installing type definitions..." -ForegroundColor White
npm install --save-dev @types/bcryptjs@2.4.6
npm install --save-dev @types/node@20.10.6
npm install --save-dev @types/react@18.3.1
npm install --save-dev @types/react-dom@18.3.0
npm install --save-dev typescript@5.3.3

Write-Host "`n[PHASE 6] UI Dependencies" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "  → Installing UI libraries (with legacy peer deps)..." -ForegroundColor White
npm install --legacy-peer-deps

Write-Host "`n[PHASE 7] Prisma Client Generation" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "  → Generating Prisma Client..." -ForegroundColor White
npx prisma generate

Write-Host "`n[PHASE 8] Environment Validation" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

if (-not (Test-Path ".env")) {
    Write-Host "  ⚠️  .env file not found. Creating template..." -ForegroundColor Yellow
    
    @"
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gmppayroll"

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"

# Optional: OAuth Providers
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
"@ | Out-File -FilePath ".env" -Encoding utf8
    
    Write-Host "  ✅ .env template created. CONFIGURE IT NOW!" -ForegroundColor Green
} else {
    Write-Host "  ✅ .env file exists" -ForegroundColor Green
}

Write-Host "`n[PHASE 9] Final Verification" -ForegroundColor Yellow
Write-Host "────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check critical packages
Write-Host "  → Verifying package installations..." -ForegroundColor White
$packages = @("next-auth", "bcryptjs", "@prisma/client", "next", "react")
foreach ($pkg in $packages) {
    $version = (npm list $pkg --depth=0 2>&1 | Select-String $pkg).ToString().Trim()
    if ($version) {
        Write-Host "    ✅ $version" -ForegroundColor Green
    } else {
        Write-Host "    ❌ $pkg NOT INSTALLED" -ForegroundColor Red
    }
}

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ INSTALLATION COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Configure .env file with your DATABASE_URL" -ForegroundColor White
Write-Host "  2. Verify NEXTAUTH_SECRET is set" -ForegroundColor White
Write-Host "  3. Run: npm run dev" -ForegroundColor Cyan
Write-Host "  4. Test: http://localhost:3000/auth/login" -ForegroundColor Cyan

Write-Host "`n⚠️  IMPORTANT CHECKS:" -ForegroundColor Yellow
Write-Host "  → Ensure DATABASE_URL is correct" -ForegroundColor White
Write-Host "  → NEXTAUTH_SECRET must be at least 32 characters" -ForegroundColor White
Write-Host "  → Run 'npx prisma migrate dev' if database is new" -ForegroundColor White

Write-Host "`n"
