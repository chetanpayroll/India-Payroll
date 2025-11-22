import { NextRequest, NextResponse } from 'next/server'
import { payrollElementsService } from '@/lib/services/payroll-elements-service'

/**
 * POST /api/payroll/elements/compliance
 * Create a compliance mapping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.elementId || !body.countryCode || !body.complianceAuthority || !body.effectiveFrom) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: elementId, countryCode, complianceAuthority, effectiveFrom'
        },
        { status: 400 }
      )
    }

    // Convert dates
    if (typeof body.effectiveFrom === 'string') {
      body.effectiveFrom = new Date(body.effectiveFrom)
    }
    if (body.effectiveTo && typeof body.effectiveTo === 'string') {
      body.effectiveTo = new Date(body.effectiveTo)
    }

    const mapping = await payrollElementsService.addComplianceMapping(body)

    return NextResponse.json({
      success: true,
      data: mapping,
      message: 'Compliance mapping created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating compliance mapping:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create compliance mapping'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payroll/elements/compliance?elementId=xxx&countryCode=xxx
 * Get compliance mappings
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const elementId = searchParams.get('elementId')
    const countryCode = searchParams.get('countryCode') || undefined

    if (!elementId) {
      return NextResponse.json(
        {
          success: false,
          error: 'elementId is required'
        },
        { status: 400 }
      )
    }

    const mappings = await payrollElementsService.getComplianceMappings(elementId, countryCode)

    return NextResponse.json({
      success: true,
      data: mappings
    })
  } catch (error: any) {
    console.error('Error fetching compliance mappings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch compliance mappings'
      },
      { status: 500 }
    )
  }
}
