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
        const employee = await prisma.employee.findUnique({
            where: { id: params.id },
            include: {
                entity: true,
                contracts: true,
                salaryElements: {
                    include: {
                        element: true
                    }
                }
            }
        });

        if (!employee) {
            return new NextResponse('Employee not found', { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('[EMPLOYEE_GET]', error);
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

        const employee = await prisma.employee.update({
            where: { id: params.id },
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                nationality: body.nationality,
                emiratesIdNo: body.emiratesIdNo,
                passportNo: body.passportNo,
                email: body.email,
                phone: body.phone,
                entityId: body.entityId,
                designation: body.designation,
                department: body.department,
                joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                status: body.status,
                basicSalary: body.basicSalary,
                bankName: body.bankName,
                iban: body.iban,
                bankAccountNo: body.bankAccountNo,
                isEmirati: body.isEmirati,
                gpssaNumber: body.gpssaNumber,
            }
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error('[EMPLOYEE_UPDATE]', error);
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
        await prisma.employee.delete({
            where: { id: params.id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[EMPLOYEE_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
