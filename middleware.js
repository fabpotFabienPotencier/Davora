import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const isAuth = request.cookies.get('davora_auth')?.value === '1';

  // Extract the bare domain (e.g. "davora.xyz") for building redirect URLs
  const baseDomain = hostname.replace(/^(www\.|chat\.|login\.|signup\.)/, '');

  // Always allow legal pages, shared chats, and API routes on any subdomain
  if (
    url.pathname.startsWith('/terms') ||
    url.pathname.startsWith('/privacy') ||
    url.pathname.startsWith('/share')
  ) {
    return NextResponse.next();
  }

  // ── www.davora.xyz or bare davora.xyz → Smart Gateway ──
  if (hostname.startsWith('www.') || hostname === baseDomain) {
    const target = isAuth
      ? `https://chat.${baseDomain}`
      : `https://login.${baseDomain}`;
    return NextResponse.redirect(new URL(target));
  }

  // ── login.davora.xyz ──
  if (hostname.startsWith('login.')) {
    // Already authenticated? Skip login, go straight to chat
    if (isAuth) {
      return NextResponse.redirect(new URL(`https://chat.${baseDomain}`));
    }
    // Serve the /login page at the root path (URL stays clean as login.davora.xyz)
    if (url.pathname === '/') {
      url.pathname = '/login';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── signup.davora.xyz ──
  if (hostname.startsWith('signup.')) {
    // Already authenticated? Skip signup, go straight to chat
    if (isAuth) {
      return NextResponse.redirect(new URL(`https://chat.${baseDomain}`));
    }
    // Serve the /signup page at the root path
    if (url.pathname === '/') {
      url.pathname = '/signup';
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── chat.davora.xyz ──
  if (hostname.startsWith('chat.')) {
    // Not authenticated? Bounce to login
    if (!isAuth) {
      return NextResponse.redirect(new URL(`https://login.${baseDomain}`));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
