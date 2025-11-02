export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';

  try {
    await getDb();
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in 10 minutes.' }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    console.error("Rate limiter error:", err);
  }

  // Fetch Lua loader dynamically
  const lua = await fetch("https://raw.githubusercontent.com/Van1a/Code/refs/heads/main/src/app/api/justAscript/code.txt")
    .then(r => r.text())
    .catch(() => "print('Error: Failed to load script')")

  return new Response(lua, {
    headers: { "Content-Type": "text/plain" }
  });
}
