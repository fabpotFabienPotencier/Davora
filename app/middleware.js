import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Handle authentication subdomain logic
  // If user visits login.davora.xyz, rewrite to the /login directory invisibly
  if (hostname.startsWith('login.')) {
    if (url.pathname === '/') {
      url.pathname = '/login';
    }
    return NextResponse.rewrite(url);
  }

  // If user visits signup.davora.xyz, rewrite to the /signup directory invisibly
  if (hostname.startsWith('signup.')) {
    if (url.pathname === '/') {
      url.pathname = '/signup';
    }
    return NextResponse.rewrite(url);
  }

  // For chat.davora.xyz and davora.xyz, they serve the main page (/) naturally.
  return NextResponse.next();
}

export const config = {
  // Only run middleware on paths that aren't static files or APIs
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
