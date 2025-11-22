import { NextRequest, NextResponse } from 'next/server'
import { payrollElementsService } from '@/lib/services/payroll-elements-service'

/**
 * GET /api/payroll/elements/[id]
 * Get a specific payroll element by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const element = await payrollElementsService.getElementById(params.id)

    if (!element) {
      return NextResponse.json(
        {
          success: false,
          error: 'Element not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: element
    })
  } catch (error: any) {
    console.error('Error fetching element:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch element'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/payroll/elements/[id]
 * Update a payroll element
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const element = await payrollElementsService.updateElement(params.id, body)

    return NextResponse.json({
      success: true,
      data: element,
      message: 'Payroll element updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating element:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update element'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/payroll/elements/[id]
 * Delete a payroll element
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await payrollElementsService.deleteElement(params.id)

    return NextResponse.json({
      success: true,
      message: 'Payroll element deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting element:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete element'
      },
      { status: 500 }
    )
  }
}
