@echo off
echo FORCE SYNC SCHEMA
set "DATABASE_URL=postgresql://postgres.tckakhhflkaunqeauvcy:Manish%%40123%%40%%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
set "DIRECT_URL=postgresql://postgres.tckakhhflkaunqeauvcy:Manish%%40123%%40%%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

echo Pushing schema with accept-data-loss...
call npx prisma db push --schema=..\prisma\schema.prisma --accept-data-loss --skip-generate

echo Done.
