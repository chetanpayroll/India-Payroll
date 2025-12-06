@echo off

echo ===================================================
echo   GMP PAYROLL - FINAL DEPLOYMENT
echo ===================================================
echo.

REM Set Environment Variables explicitly
REM Note: Percent signs are escaped as %%
set "DATABASE_URL=postgresql://postgres.tckakhhflkaunqeauvcy:Manish%%40123%%40%%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
set "DIRECT_URL=postgresql://postgres.tckakhhflkaunqeauvcy:Manish%%40123%%40%%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

echo Environment variables set.
echo DATABASE_URL is stored (hidden for security).

echo.
echo [1/2] Generating Prisma Client...
call npx prisma generate --schema=..\prisma\schema.prisma

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prisma Generate Failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Pushing Database Schema...
echo This will sync the schema to the database...
call npx prisma db push --schema=..\prisma\schema.prisma

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database Push Failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Database is successfully deployed!
echo You can now start the application.
pause
