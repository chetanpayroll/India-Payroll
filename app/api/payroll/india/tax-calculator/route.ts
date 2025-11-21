// ============================================================================
// INDIA TAX CALCULATOR API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { IndiaTaxCalculator } from '@/lib/payroll/engines/india/IndiaTaxCalculator';

/**
 * Calculate annual tax and compare regimes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { annualIncome, regime, declarations, age } = body;

    if (!annualIncome || annualIncome <= 0) {
      return NextResponse.json(
        { error: 'Valid annual income is required' },
        { status: 400 }
      );
    }

    // If no regime specified, compare both
    if (!regime || regime === 'COMPARE') {
      const comparison = IndiaTaxCalculator.compareRegimes(
        annualIncome,
        declarations,
        age
      );

      return NextResponse.json({
        success: true,
        comparison: {
          oldRegime: {
            ...comparison.oldRegime,
            effectiveRate: IndiaTaxCalculator.getEffectiveTaxRate(
              comparison.oldRegime.totalTax,
              annualIncome
            ),
          },
          newRegime: {
            ...comparison.newRegime,
            effectiveRate: IndiaTaxCalculator.getEffectiveTaxRate(
              comparison.newRegime.totalTax,
              annualIncome
            ),
          },
          recommendation: comparison.recommendation,
          savings: comparison.savings,
        },
      });
    }

    // Calculate for specific regime
    const taxDetails = IndiaTaxCalculator.calculateAnnualTDS(
      annualIncome,
      regime as 'OLD' | 'NEW',
      declarations,
      age
    );

    return NextResponse.json({
      success: true,
      taxDetails: {
        ...taxDetails,
        effectiveRate: IndiaTaxCalculator.getEffectiveTaxRate(taxDetails.totalTax, annualIncome),
        marginalRate: IndiaTaxCalculator.getMarginalTaxRate(taxDetails.taxableIncome, regime, age),
      },
    });

  } catch (error) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for quick tax estimate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const income = parseFloat(searchParams.get('income') || '0');
    const regime = searchParams.get('regime') || 'NEW';

    if (!income || income <= 0) {
      return NextResponse.json(
        { error: 'Valid income parameter is required' },
        { status: 400 }
      );
    }

    const taxDetails = IndiaTaxCalculator.calculateAnnualTDS(
      income,
      regime as 'OLD' | 'NEW'
    );

    return NextResponse.json({
      income,
      regime,
      taxableIncome: taxDetails.taxableIncome,
      totalTax: taxDetails.totalTax,
      monthlyTDS: taxDetails.monthlyTDS,
      effectiveRate: IndiaTaxCalculator.getEffectiveTaxRate(taxDetails.totalTax, income),
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    );
  }
}
