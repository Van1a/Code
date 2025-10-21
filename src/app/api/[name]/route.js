export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const blacklist = ["new", "Shop -> Codes","Claim button"];

export async function GET(req, context) {
  try {
    const name = context.params.name;
    const url = `https://beebom.com/${name}-codes/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const data = { Active: [], Expire: [] };

    $('.wp-block-list strong').each((_, s) => {
      const text = $(s).text().trim();
      if (text && !blacklist.some(w => text.toLowerCase().includes(w))) data.Active.push(text);
    });

    $('.wp-block-list.is-style-inline-divider-list li').each((_, li) => {
      const text = $(li).text().trim();
      if (text && !blacklist.some(w => text.toLowerCase().includes(w))) data.Expire.push(text);
    });

    const metadata = { Discord: "https://discord.gg/KA7Y9P4Jss", Version: 1, Time: new Date().toISOString() };
    const wrapped = {
      Name: name,
      Total: { Active: data.Active.length, Expire: data.Expire.length },
      ...data,
      metadata
    };

    return NextResponse.json({ data: wrapped });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch codes', details: err.message }, { status: 500 });
  }
                                  }
