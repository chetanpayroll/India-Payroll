// ============================================================================
// INDIA STATUTORY CALCULATOR API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { IndiaStatutoryCalculator } from '@/lib/payroll/engines/india/IndiaStatutoryCalculator';

/**
 * Calculate all statutory deductions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { basic, da = 0, grossSalary, state, month, calculationType } = body;

    const result: Record<string, any> = {};

    // Calculate based on type or all
    if (!calculationType || calculationType === 'all' || calculationType === 'pf') {
      if (basic) {
        result.pf = IndiaStatutoryCalculator.calculatePF(basic, da);
      }
    }

    if (!calculationType || calculationType === 'all' || calculationType === 'esic') {
      if (grossSalary) {
        result.esic = IndiaStatutoryCalculator.calculateESIC(grossSalary);
      }
    }

    if (!calculationType || calculationType === 'all' || calculationType === 'pt') {
      if (grossSalary && state) {
        result.pt = IndiaStatutoryCalculator.calculatePT(grossSalary, state, month);
      }
    }

    if (!calculationType || calculationType === 'all' || calculationType === 'lwf') {
      if (state && month) {
        result.lwf = IndiaStatutoryCalculator.calculateLWF(state, month);
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('Statutory calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate statutory deductions' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for quick PF/ESIC calculation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const amount = parseFloat(searchParams.get('amount') || '0');
    const state = searchParams.get('state');

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'type and amount are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type.toLowerCase()) {
      case 'pf':
        result = IndiaStatutoryCalculator.calculatePF(amount);
        break;
      case 'esic':
        result = IndiaStatutoryCalculator.calculateESIC(amount);
        break;
      case 'pt':
        if (!state) {
          return NextResponse.json(
            { error: 'state is required for PT calculation' },
            { status: 400 }
          );
        }
        result = IndiaStatutoryCalculator.calculatePT(amount, state);
        break;
      case 'gratuity':
        const years = parseFloat(searchParams.get('years') || '0');
        result = IndiaStatutoryCalculator.calculateGratuity(amount, years);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown calculation type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type,
      input: { amount, state },
      result,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate' },
      { status: 500 }
    );
  }
}
