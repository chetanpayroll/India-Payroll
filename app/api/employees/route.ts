import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const entityId = searchParams.get('entityId')

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (entityId) {
      where.entityId = entityId
    }

    // Fetch employees with basic information
    const employees = await prisma.employee.findMany({
      where,
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        designation: true,
        department: true,
        status: true,
        joinDate: true,
        endDate: true,
        entityId: true,
        entity: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: employees
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch employees'
      },
      { status: 500 }
    )
  }
}
