// GMP Payroll - Payroll API Endpoints
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Removed legacy imports

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const companyId = searchParams.get('companyId');

        const where: any = {};

        if (year) where.payrollYear = parseInt(year);
        if (month) where.payrollMonth = parseInt(month);
        if (companyId) where.companyId = companyId;

        const payrollRuns = await prisma.payrollRun.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                company: true
            }
        });

        return NextResponse.json(payrollRuns);
    } catch (error) {
        console.error('[PAYROLL_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.payrollMonth || !body.payrollYear || !body.companyId) {
            return new NextResponse('Missing required fields (month, year, companyId)', { status: 400 });
        }

        // Check if run already exists
        const existingRun = await prisma.payrollRun.findFirst({
            where: {
                companyId: body.companyId,
                payrollMonth: body.payrollMonth,
                payrollYear: body.payrollYear
            }
        });

        if (existingRun) {
            return new NextResponse('Payroll run already exists for this period', { status: 409 });
        }

        const payrollRun = await prisma.payrollRun.create({
            data: {
                companyId: body.companyId,
                payrollMonth: body.payrollMonth,
                payrollYear: body.payrollYear,
                payPeriodStart: new Date(body.payPeriodStart || `${body.payrollYear}-${body.payrollMonth}-01`),
                payPeriodEnd: new Date(body.payPeriodEnd || `${body.payrollYear}-${body.payrollMonth}-28`), // Simple default
                status: body.status || 'Draft',
                totalEmployees: body.totalEmployees || 0,
                totalGross: body.totalGross || 0,
                totalDeductions: body.totalDeductions || 0,
                totalNetPay: body.totalNetPay || 0,
            }
        });

        return NextResponse.json(payrollRun);
    } catch (error) {
        console.error('[PAYROLL_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
