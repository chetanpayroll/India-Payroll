import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');

        const where: any = {};

        if (year) {
            where.payrollYear = parseInt(year);
        }

        if (month) {
            where.payrollMonth = parseInt(month);
        }

        const payrollRuns = await prisma.payrollRun.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(payrollRuns);
    } catch (error) {
        console.error('[PAYROLL_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();

        // Basic validation
        if (!body.payrollMonth || !body.payrollYear) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const payrollRun = await prisma.payrollRun.create({
            data: {
                payrollMonth: body.payrollMonth,
                payrollYear: body.payrollYear,
                status: body.status || 'DRAFT',
                totalEmployees: body.totalEmployees || 0,
                totalGross: body.totalGross || 0,
                totalDeductions: body.totalDeductions || 0,
                totalNet: body.totalNet || 0,
                processingDate: new Date(),
            }
        });

        return NextResponse.json(payrollRun);
    } catch (error) {
        console.error('[PAYROLL_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
