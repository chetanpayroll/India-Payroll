@echo off

echo ===================================================
echo   GMP PAYROLL - DATABASE FIX & DEPLOY (FINAL)
echo ===================================================
echo.

set "PROJECT_REF=tckakhhflkaunqeauvcy"
set "DB_PASSWORD=Manish%%40123"

REM ATTEMPT 5: FORCE POOLER (Port 6543) for DIRECT_URL as well
REM This is risky for migrations but might work for db push
echo [INFO] Trying Forced Pooler Connection (Port 6543) for Everything...

set "DATABASE_URL=postgresql://postgres.%PROJECT_REF%:%DB_PASSWORD%@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
set "DIRECT_URL=postgresql://postgres.%PROJECT_REF%:%DB_PASSWORD%@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

echo URL: postgresql://postgres.%PROJECT_REF%:****@aws-0-ap-south-1.pooler.supabase.com:6543...

call npx prisma db push --schema=..\prisma\schema.prisma

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Database pushed successfully!
    goto :end
)

echo.
echo [FAIL] Final attempt failed.
echo Logs might show 'prepared statement' errors if connection succeeded.
echo If so, we bypassed the network block but hit pooler limitations.

:end
pause
