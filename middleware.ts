import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Only handle admin sub-paths
    if (pathname.startsWith('/admin7276')) {
      // 1. Always allow the root admin path and its assets
      if (
        pathname === '/admin7276' ||
        pathname === '/admin7276/' ||
        pathname === '/admin7276/index.html' ||
        pathname.startsWith('/admin7276/assets/')
      ) {
        return NextResponse.next();
      }

      // 2. Check for the admin session cookie
      const session = req.cookies.get('lifeos_admin_session')?.value;
      if (session === 'true') {
        return NextResponse.next();
      }

      // 3. Redirect unauthorized nested access to the main admin login
      return NextResponse.redirect(new URL('/admin7276', req.nextUrl));
    }

    return NextResponse.next();
  } catch (error) {
    // Fail-safe: prevent 500 errors by allowing the request through
    console.error('Middleware failure:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/admin7276/:path*'],
};


