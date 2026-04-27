import { next } from '@vercel/edge';
import type { NextRequest } from '@vercel/edge';
import { NextResponse } from '@vercel/edge';

const COOKIE_NAME = 'lifeos_admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin7276')) {
    return NextResponse.next();
  }

  if (
    pathname === '/admin7276' ||
    pathname === '/admin7276/' ||
    pathname === '/admin7276/index.html' ||
    pathname.startsWith('/admin7276/assets/')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME)?.value;
  if (session === 'true') {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/admin7276';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: '/admin7276/:path*',
};
