import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const client = new MongoClient("mongodb+srv://Vercel-Admin-nerium-data:TXGXPqKKairzq63l@nerium-data.nlg9ana.mongodb.net/?retryWrites=true&w=majority");

const RATE_LIMIT = 50; // max requests per minute
const BLOCK_TIME = 10 * 60 * 1000; // 10 minutes

async function checkRateLimit(ip) {
  const db = client.db('ratelimit');
  const col = db.collection('requests');
  const now = Date.now();

  let record = await col.findOne({ ip });
  if (!record) {
    await col.insertOne({ ip, count: 1, firstRequest: now, blockedUntil: null });
    return true;
  }

  if (record.blockedUntil && now < record.blockedUntil) return false;

  if (now - record.firstRequest > 60 * 1000) {
    await col.updateOne({ ip }, { $set: { count: 1, firstRequest: now } });
    return true;
  } else if (record.count + 1 > RATE_LIMIT) {
    await col.updateOne({ ip }, { $set: { blockedUntil: now + BLOCK_TIME } });
    return false;
  } else {
    await col.updateOne({ ip }, { $inc: { count: 1 } });
    return true;
  }
}

export async function middleware(req) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  await client.connect();

  const allowed = await checkRateLimit(ip);
  if (!allowed) return NextResponse.json({ error: 'Rate limit exceeded. Try again in 10 minutes.' }, { status: 429 });

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
