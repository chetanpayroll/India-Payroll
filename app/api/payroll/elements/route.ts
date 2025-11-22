import { NextRequest, NextResponse } from 'next/server'
import { payrollElementsService } from '@/lib/services/payroll-elements-service'

/**
 * GET /api/payroll/elements
 * Get all payroll elements with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const filters: any = {}

    if (searchParams.get('countryCode')) {
      filters.countryCode = searchParams.get('countryCode')
    }
    if (searchParams.get('type')) {
      filters.type = searchParams.get('type')
    }
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category')
    }
    if (searchParams.get('isActive')) {
      filters.isActive = searchParams.get('isActive') === 'true'
    }
    if (searchParams.get('isStatutory')) {
      filters.isStatutory = searchParams.get('isStatutory') === 'true'
    }
    if (searchParams.get('isRecurring')) {
      filters.isRecurring = searchParams.get('isRecurring') === 'true'
    }

    const elements = await payrollElementsService.getAllElements(filters)

    return NextResponse.json({
      success: true,
      data: elements,
      count: elements.length
    })
  } catch (error: any) {
    console.error('Error fetching elements:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch elements'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payroll/elements
 * Create a new payroll element
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.name || !body.code || !body.type || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, code, type, category'
        },
        { status: 400 }
      )
    }

    const element = await payrollElementsService.createElement(body)

    return NextResponse.json({
      success: true,
      data: element,
      message: 'Payroll element created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating element:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create element'
      },
      { status: 500 }
    )
  }
}
