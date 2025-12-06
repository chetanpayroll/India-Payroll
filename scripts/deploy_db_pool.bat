@echo off
REM Connection String with Pooling (Port 6543) and Transaction Mode
REM Username format: postgres.[project_ref]

set "PROJECT_REF=tckakhhflkaunqeauvcy"
set "DB_PASSWORD=Manish%%40123"

REM Supabase Transaction Pooler URL
REM Try primary pooler host first
set "DATABASE_URL=postgresql://postgres.%PROJECT_REF%:%DB_PASSWORD%@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
set "DIRECT_URL=postgresql://postgres.%PROJECT_REF%:%DB_PASSWORD%@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

echo ===================================================
echo   GMP PAYROLL - DATABASE DEPLOYMENT (POOLING)
echo ===================================================
echo.
echo Trying connection to: aws-0-ap-south-1.pooler.supabase.com:6543
echo.

echo Generating Prisma Client...
call npx prisma generate --schema=..\prisma\schema.prisma

echo.
echo Pushing DB Schema...
call npx prisma db push --schema=..\prisma\schema.prisma

if errorlevel 1 (
    echo.
    echo [ERROR] Connection failed with aws-0-ap-south-1.
    echo Retrying with generic db host...
    echo.
    set "DATABASE_URL=postgresql://postgres.%PROJECT_REF%:%DB_PASSWORD%@db.%PROJECT_REF%.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
    call npx prisma db push --schema=..\prisma\schema.prisma
)

pause
