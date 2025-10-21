export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const blacklist = ["new", "Shop -> Codes", "Claim button"];

export async function GET(req, context) {
  try {
    const name = context.params.name;
    const url = `https://beebom.com/${name}-codes/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const data = { Active: {}, Expire: [] };

    $("ul.wp-block-list").first().find("li").each((_, li) => {
      const code = $(li).find("strong").text().trim();
      $(li).find("strong").remove();
      const reward = $(li).text().trim();
      if (code && !blacklist.some(w => code.toLowerCase().includes(w))) data.Active[code] = reward;
    });

    $(".wp-block-list.is-style-inline-divider-list li").each((_, li) => {
      const text = $(li).text().trim();
      if (text && !blacklist.some(w => text.toLowerCase().includes(w))) data.Expire.push(text);
    });

    const metadata = {
      Discord: "https://discord.gg/KA7Y9P4Jss",
      Version: 1.1,
      Time: new Date().toISOString()
    };

    const wrapped = {
      Name: name,
      Total: { Active: Object.keys(data.Active).length, Expire: data.Expire.length },
      ...data,
      metadata
    };

    return NextResponse.json({ data: wrapped });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch codes', details: err.message },
      { status: 500 }
    );
  }
}
