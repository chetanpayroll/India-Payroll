// ============================================================================
// SET COUNTRY API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { isCountrySupported } from '@/lib/payroll/core/countryConfig';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country } = body;

    if (!country) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    if (!isCountrySupported(country)) {
      return NextResponse.json(
        { error: `Country '${country}' is not supported` },
        { status: 400 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      country,
      message: `Country set to ${country}`,
    });

    // Set cookie for 1 year
    response.cookies.set('selected_country', country, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    console.error('Set country error:', error);
    return NextResponse.json(
      { error: 'Failed to set country' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const country = request.cookies.get('selected_country')?.value;

    return NextResponse.json({
      country: country || null,
      isSet: !!country,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get country' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Country selection cleared',
    });

    response.cookies.delete('selected_country');

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear country' },
      { status: 500 }
    );
  }
}
