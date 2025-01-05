import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);
  
  // If no network param, default to preprod
  if (!searchParams.has('network')) {
    const url = new URL(request.url);
    url.searchParams.set('network', 'preprod');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
}; 