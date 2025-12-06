// GMP Payroll - Employee API Endpoints
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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
        { employeeCode: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (department) where.department = department;
    if (status) where.status = status;

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
      }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('[EMPLOYEES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.firstName || !body.lastName || !body.employeeCode || !body.companyId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        companyId: body.companyId,
        employeeCode: body.employeeCode,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        mobile: body.mobile,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        dateOfJoining: new Date(body.dateOfJoining),
        pan: body.pan,
        uan: body.uan,
        esicIpNumber: body.esicIpNumber,
        aadhaar: body.aadhaar,
        bankAccountNumber: body.bankAccountNumber,
        bankIfsc: body.bankIfsc,
        bankName: body.bankName,
        designation: body.designation,
        department: body.department,
        location: body.location,
        employmentType: body.employmentType,
        status: body.status || 'Active',
      }
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('[EMPLOYEES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
