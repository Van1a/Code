
const store = new Map();

export function middleware(req) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  if (store.has(ip)) {
    const last = store.get(ip);
    if (now - last < 5000) {
      return new Response("Rate limit: Wait 5s", { status: 429 });
    }
  }

  store.set(ip, now);
  return;
}

export const config = {
  matcher: "/api/:path*"
};
