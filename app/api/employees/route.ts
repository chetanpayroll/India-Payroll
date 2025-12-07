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

    // 🛡️ Auto-assign Company if missing (End-to-End Fix)
    let companyId = body.companyId;
    if (!companyId) {
      // Fetch the first available company - useful for single-tenant / initial setup
      const defaultCompany = await prisma.company.findFirst();
      if (defaultCompany) {
        companyId = defaultCompany.id;
      }
    }

    // Basic validation
    if (!body.firstName || !body.lastName || !body.employeeCode || !companyId) {
      console.error('[EMPLOYEES_POST] Missing fields:', body, 'derivedCompanyId:', companyId);
      return new NextResponse(JSON.stringify({
        error: 'Missing required fields',
        details: !companyId ? 'No Company ID provided or found in DB' : 'Check fields'
      }), { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        companyId: companyId,
        employeeCode: body.employeeCode,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        mobile: body.phone || body.mobile, // Handle varied field names
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        dateOfJoining: new Date(body.joinDate || body.dateOfJoining), // Handle varied field names
        pan: body.pan,
        uan: body.uan,
        esicIpNumber: body.esicNumber || body.esicIpNumber,
        aadhaar: body.aadhaar,

        bankAccountNumber: body.bankAccountNo || body.bankAccountNumber,
        bankIfsc: body.ifsc || body.bankIfsc,
        bankName: body.bankName,

        designation: body.designation,
        department: body.department,
        location: body.location || 'Head Office',
        employmentType: body.contractType || body.employmentType || 'Permanent',

        // Salary Structure (if provided directly)
        // Note: Ideally create SalaryStructure record separately, but storing base if fields exist on model
        // prisma schema doesn't have these on employee table? Checking schema...
        // Schema has SalaryStructure table. We'll skip adding them to employee directly if invalid.

        status: body.status || 'Active',
      }
    });

    // Optionally create Salary Structure if fields present
    if (body.basicSalary) {
      await prisma.salaryStructure.create({
        data: {
          employeeId: employee.id,
          effectiveFrom: new Date(),
          basicSalary: parseFloat(body.basicSalary) || 0,
          hra: parseFloat(body.hra) || 0,
          specialAllowance: parseFloat(body.specialAllowance) || 0,
          medicalAllowance: parseFloat(body.medicalAllowance) || 0,
          otherAllowances: parseFloat(body.otherAllowances) || 0,
        }
      });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('[EMPLOYEES_POST]', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
