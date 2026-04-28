import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'lifeos_admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to admin routes
  if (pathname.startsWith('/admin7276')) {
    // 1. Allow root admin page and static assets
    if (
      pathname === '/admin7276' ||
      pathname === '/admin7276/' ||
      pathname === '/admin7276/index.html' ||
      pathname.startsWith('/admin7276/assets/')
    ) {
      return NextResponse.next();
    }

    // 2. Check session for protected nested routes
    const session = request.cookies.get(COOKIE_NAME)?.value;
    if (session === 'true') {
      return NextResponse.next();
    }

    // 3. Unauthorized access to sub-paths gets redirected to login
    return NextResponse.redirect(new URL('/admin7276', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin7276/:path*'],
};

