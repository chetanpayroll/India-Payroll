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
    const query = searchParams.get('query');
    const department = searchParams.get('department');
    const status = searchParams.get('status');

    const where: any = {};

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { employeeNumber: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        entity: true,
      }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('[EMPLOYEES_GET]', error);
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
    if (!body.firstName || !body.lastName || !body.employeeNumber || !body.entityId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeNumber: body.employeeNumber,
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
        joinDate: new Date(body.joinDate),
        status: body.status || 'ACTIVE',
        basicSalary: body.basicSalary,
        bankName: body.bankName,
        iban: body.iban,
        bankAccountNo: body.bankAccountNo,
        isEmirati: body.isEmirati || false,
        gpssaNumber: body.gpssaNumber,
      }
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('[EMPLOYEES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
