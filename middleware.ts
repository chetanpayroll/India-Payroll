// ============================================================================
// MIDDLEWARE - COUNTRY ROUTING
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require country selection
const COUNTRY_REQUIRED_ROUTES = [
  '/dashboard/payroll/new',
  '/dashboard/payroll/india',
  '/dashboard/employees/india',
];

// Routes that should redirect to country-specific versions
const COUNTRY_AWARE_ROUTES = [
  '/dashboard/payroll',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get selected country from cookie
  const selectedCountry = request.cookies.get('selected_country')?.value;

  // Skip middleware for static files, API routes (except payroll), and auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if route requires country selection
  const requiresCountry = COUNTRY_REQUIRED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  // If accessing India routes without selecting India, redirect
  if (pathname.startsWith('/dashboard/payroll/india') && selectedCountry !== 'INDIA') {
    // Allow access but maybe show a notice
    // For now, allow through to let the UI handle it
    return NextResponse.next();
  }

  // If accessing employee India routes without selecting India
  if (pathname.startsWith('/dashboard/employees/india') && selectedCountry !== 'INDIA') {
    return NextResponse.next();
  }

  // For main payroll route, check if we should redirect based on country
  if (pathname === '/dashboard/payroll' && selectedCountry === 'INDIA') {
    // Optionally redirect to India payroll
    // For now, let user choose manually
    return NextResponse.next();
  }

  // Add country header for API consumption
  const response = NextResponse.next();
  if (selectedCountry) {
    response.headers.set('x-selected-country', selectedCountry);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
