// middleware.js (at the root of your project)
import { NextResponse } from 'next/server';
import LRU from 'lru-cache';

const tokenCache = new LRU({
  max: 5000,
  ttl: 10 * 60 * 1000 // 10 minutes block
});

const RATE_LIMIT = 50; // max requests per minute

export function middleware(req) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || req.socket?.remoteAddress;
  const now = Date.now();
  const current = tokenCache.get(ip) || { count: 0, firstRequest: now };

  if (now - current.firstRequest > 60 * 1000) {
    current.count = 1;
    current.firstRequest = now;
  } else {
    current.count++;
  }

  tokenCache.set(ip, current);

  if (current.count > RATE_LIMIT) {
    return new NextResponse(
      JSON.stringify({ error: 'Rate limit exceeded. Try again in 10 minutes.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

// Apply middleware only to API routes
export const config = {
  matcher: '/api/:path*',
};
