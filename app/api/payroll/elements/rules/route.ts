import { NextRequest, NextResponse } from 'next/server'
import { payrollElementsService } from '@/lib/services/payroll-elements-service'

/**
 * POST /api/payroll/elements/rules
 * Create a new calculation rule
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation
    if (!body.elementId || !body.ruleName || !body.ruleType || !body.formula || !body.effectiveFrom) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: elementId, ruleName, ruleType, formula, effectiveFrom'
        },
        { status: 400 }
      )
    }

    // Convert effectiveFrom to Date if it's a string
    if (typeof body.effectiveFrom === 'string') {
      body.effectiveFrom = new Date(body.effectiveFrom)
    }
    if (body.effectiveTo && typeof body.effectiveTo === 'string') {
      body.effectiveTo = new Date(body.effectiveTo)
    }

    const rule = await payrollElementsService.addRule(body)

    return NextResponse.json({
      success: true,
      data: rule,
      message: 'Calculation rule created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating rule:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create rule'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payroll/elements/rules?elementId=xxx
 * Get all rules for an element
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const elementId = searchParams.get('elementId')

    if (!elementId) {
      return NextResponse.json(
        {
          success: false,
          error: 'elementId is required'
        },
        { status: 400 }
      )
    }

    const rules = await payrollElementsService.getElementRules(elementId)

    return NextResponse.json({
      success: true,
      data: rules
    })
  } catch (error: any) {
    console.error('Error fetching rules:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch rules'
      },
      { status: 500 }
    )
  }
}
