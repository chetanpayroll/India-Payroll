# ================================================================
# QUICK START - RUN THIS TO START DEVELOPMENT
# ================================================================

Write-Host "🚀 Starting GMP Payroll System..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "➜  Copy docs\.env.local.TEMPLATE to .env and configure it" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

# Generate Prisma Client
Write-Host "⚙️  Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Start development server
Write-Host "✅ Starting development server..." -ForegroundColor Green
Write-Host "➜  Local:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "➜  Login:   http://localhost:3000/auth/login" -ForegroundColor Cyan
Write-Host ""

npm run dev
