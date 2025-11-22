import { NextRequest, NextResponse } from 'next/server'
import { payrollElementsService } from '@/lib/services/payroll-elements-service'

/**
 * POST /api/payroll/elements/calculate
 * Calculate element amounts for an employee
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.employeeId || !body.countryCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: employeeId, countryCode'
        },
        { status: 400 }
      )
    }

    const calculationDate = body.calculationDate
      ? new Date(body.calculationDate)
      : new Date()

    const results = await payrollElementsService.calculateAllElements(
      body.employeeId,
      body.countryCode,
      calculationDate
    )

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Elements calculated successfully'
    })
  } catch (error: any) {
    console.error('Error calculating elements:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate elements'
      },
      { status: 500 }
    )
  }
}
