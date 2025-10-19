export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const blacklist = ["new"];

export async function GET(req, context) {
  try {
    const name = context.params.name;
    const url = `https://beebom.com/${name}-codes/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const data = { Active: [], Expire: [] };

    $('.wp-block-list li strong').each((_, s) => {
      const text = $(s).text().trim();
      if (text && !blacklist.some(w => text.toLowerCase().includes(w))) data.Active.push(text);
    });

    $('.wp-block-list.is-style-inline-divider-list li').each((_, li) => {
      const text = $(li).text().trim();
      if (text && !blacklist.some(w => text.toLowerCase().includes(w))) data.Expire.push(text);
    });

    return NextResponse.json({ Name: name, ...data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch codes', details: err.message }, { status: 500 });
  }
}