@echo off
set "DATABASE_URL=postgresql://postgres:Manish%%40123%%40%%40@db.tckakhhflkaunqeauvcy.supabase.co:5432/postgres?sslmode=require"
set "DIRECT_URL=postgresql://postgres:Manish%%40123%%40%%40@db.tckakhhflkaunqeauvcy.supabase.co:5432/postgres?sslmode=require"
echo Generating Prisma Client...
call npx prisma generate --schema=..\prisma\schema.prisma
echo Pushing DB Schema...
call npx prisma db push --schema=..\prisma\schema.prisma
