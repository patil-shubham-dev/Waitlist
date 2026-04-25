import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin7276 routes
  if (pathname.startsWith('/admin7276')) {
    const session = request.cookies.get('admin_session');

    // Allow the login page itself (root of /admin7276)
    if (pathname === '/admin7276' || pathname === '/admin7276/' || pathname === '/admin7276/index.html') {
      return NextResponse.next();
    }

    // Require session for anything else in /admin7276/
    if (!session || session.value !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin7276';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin7276/:path*',
};
