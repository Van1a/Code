export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

const blacklist = ["Shop -> Codes", "Claim button"];
const pasteId = "SD3cieyJ";
const pasteToken = "wZr0tOVIbx3tqyAUSGYMEaEr3TCKOpMAf4czTrTvrr03Cb5EkFOs4MdDNQZh";

export async function GET(req, context) {
  let apiServe = "0";

  try {
    // --- Pastefy increment in one line ---
    await axios.get(`https://pastefy.app/api/v2/paste/${pasteId}`)
      .then(r => (apiServe = r.data.content || "0") && axios.put(
        `https://pastefy.app/api/v2/paste/${pasteId}`,
        { content: (+r.data.content + 1).toString() },
        { headers: { Authorization: `Bearer ${pasteToken}` } }
      )).catch(() => {});

    const name = context.params.name;
    const url = `https://beebom.com/${name}-codes/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const data = { Active: [], Expire: [] };

    $("ul.wp-block-list").first().find("li").each((_, li) => {
      const markTag = $(li).find("mark");
      const isNew = markTag.length > 0;
      markTag.remove();

      const code = $(li).find("strong").text().trim();
      $(li).find("strong").remove();

      let reward = $(li).text().trim().replace(/\(\s*\)/g, '').replace(/^:\s*/, '').trim();

      if (code && !blacklist.some(w => code.toLowerCase().includes(w.toLowerCase())))
        data.Active.push({ Code: code, Reward: reward, isNew });
    });

    $(".wp-block-list.is-style-inline-divider-list li").each((_, li) => {
      $(li).find("mark").remove();
      const text = $(li).text().trim();
      if (text && !blacklist.some(w => text.toLowerCase().includes(w.toLowerCase())))
        data.Expire.push(text);
    });

    const metadata = {
      Discord: "https://discord.gg/KA7Y9P4Jss",
      Version: 1.1,
      Time: new Date().toISOString(),
      apiServe
    };

    const wrapped = {
      Name: name,
      Total: { Active: data.Active.length, Expire: data.Expire.length },
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
