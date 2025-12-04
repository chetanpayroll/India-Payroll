# Quick NextAuth Fix - Essential Packages Only
# Run this in PowerShell from your project root

Write-Host "🔧 Installing essential NextAuth packages..." -ForegroundColor Cyan

# Install only what's needed for JWT-based NextAuth
npm install next-auth@4.24.7 bcryptjs@2.4.3 --legacy-peer-deps

# Install type definitions
npm install --save-dev @types/bcryptjs@2.4.6

Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Cyan
