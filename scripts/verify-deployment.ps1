# Production Deployment Verification Script
# Run this before deploying to Vercel

Write-Host "GMP Payroll System - Production Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0
$passed = 0

Write-Host "Checking Project Structure..." -ForegroundColor Yellow
Write-Host ""

# Check critical files
$criticalFiles = @(
    "lib\auth.ts",
    "prisma\schema.prisma",
    "package.json",
    "next.config.js"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "[OK] $file found" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "[ERROR] $file not found!" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "Checking Security Configuration..." -ForegroundColor Yellow
Write-Host ""

# Check .env.local
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "DISABLE_AUTH=true") {
        Write-Host "[OK] Dev mode authentication configured" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "[WARN] .env.local should have DISABLE_AUTH=true for dev" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "[WARN] .env.local not found (create from docs\.env.local.TEMPLATE)" -ForegroundColor Yellow
    $warnings++
}

# Check .gitignore
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Host "[OK] Environment files in .gitignore" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "[ERROR] .gitignore should include .env files" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "Checking Authentication Implementation..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "lib\auth.ts") {
    $authContent = Get-Content "lib\auth.ts" -Raw
    
    if ($authContent -match "DISABLE_AUTH") {
        Write-Host "[OK] Dev mode check implemented" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "[ERROR] Missing DISABLE_AUTH check" -ForegroundColor Red
        $errors++
    }
    
    if ($authContent -match "bcrypt\.compare") {
        Write-Host "[OK] Password hashing implemented" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "[ERROR] Missing bcrypt password verification" -ForegroundColor Red
        $errors++
    }
    
    if ($authContent -match "prisma\.user\.findUnique") {
        Write-Host "[OK] Database authentication implemented" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "[ERROR] Missing database user lookup" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "RESULTS" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Warnings: $warnings" -ForegroundColor Yellow
Write-Host "Errors: $errors" -ForegroundColor Red
Write-Host ""

if ($errors -eq 0) {
    Write-Host "PROJECT IS READY FOR DEPLOYMENT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Create production database" -ForegroundColor White
    Write-Host "2. Set Vercel environment variables:" -ForegroundColor White
    Write-Host "   - DATABASE_URL" -ForegroundColor Gray
    Write-Host "   - NEXTAUTH_URL" -ForegroundColor Gray
    Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor Gray
    Write-Host "3. DO NOT set DISABLE_AUTH in Vercel" -ForegroundColor Yellow
    Write-Host "4. Deploy to Vercel" -ForegroundColor White
    Write-Host "5. Create admin user" -ForegroundColor White
    Write-Host ""
    Write-Host "See docs\DEPLOYMENT_VERIFICATION_CHECKLIST.md for details" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "DEPLOYMENT BLOCKED - Fix errors first!" -ForegroundColor Red
    Write-Host ""
    exit 1
}
