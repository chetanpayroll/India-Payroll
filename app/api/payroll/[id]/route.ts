import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const payrollRun = await prisma.payrollRun.findUnique({
            where: { id: params.id },
            include: {
                items: true
            }
        });

        if (!payrollRun) {
            return new NextResponse('Payroll Run not found', { status: 404 });
        }

        return NextResponse.json(payrollRun);
    } catch (error) {
        console.error('[PAYROLL_RUN_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();

        const payrollRun = await prisma.payrollRun.update({
            where: { id: params.id },
            data: {
                status: body.status,
                totalEmployees: body.totalEmployees,
                totalGross: body.totalGross,
                totalDeductions: body.totalDeductions,
                totalNet: body.totalNet,
                finalizedAt: body.status === 'FINALIZED' ? new Date() : undefined,
            }
        });

        return NextResponse.json(payrollRun);
    } catch (error) {
        console.error('[PAYROLL_RUN_UPDATE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        await prisma.payrollRun.delete({
            where: { id: params.id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[PAYROLL_RUN_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
