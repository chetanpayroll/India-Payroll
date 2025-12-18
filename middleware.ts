
import { NextRequest, NextResponse } from 'next/server';

const isDemoMode = process.env.DEMO_MODE === 'true';

async function verifySessionToken(token: string, req: NextRequest) {
  try {
    const response = await fetch(new URL('/api/auth/verify', req.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `authToken=${token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return { valid: false };
  } catch (error) {
    console.error('Error verifying session token:', error);
    return { valid: false };
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const publicPaths = ['/auth/login', '/auth/register', '/'];
  const isPublicPath = publicPaths.includes(pathname);

  if (isDemoMode) {
    return NextResponse.next();
  }

  const token = req.cookies.get('authToken')?.value;

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (token) {
    const { valid } = await verifySessionToken(token, req);
    if (!valid && !isPublicPath) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    if (valid && isPublicPath && pathname !== '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
