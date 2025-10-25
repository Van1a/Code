export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req, context) {
  let apiServe = "0";

  try {
    await axios.get(`https://pastefy.app/api/v2/paste/SD3cieyJ`)
      .then(r => {
        apiServe = r.data.content || "0";
        return axios.put(
          `https://pastefy.app/api/v2/paste/SD3cieyJ`,
          { content: (+r.data.content + 1).toString() },
          { headers: { Authorization: `Bearer wZr0tOVIbx3tqyAUSGYMEaEr3TCKOpMAf4czTrTvrr03Cb5EkFOs4MdDNQZh` } }
        );
      }).catch(() => {});

    const name = context.params.name;
    const res = await axios.get(`https://beebom.com/${name}-codes/`);
    const $ = cheerio.load(res.data);
    const data = { Active: [], Expire: [] };

    $("ul.wp-block-list").first().find("li").each((_, li) => {
      const markTag = $(li).find("mark");
      const isNew = markTag.length > 0;
      markTag.remove();

      const code = $(li).find("strong").text().trim();
      $(li).find("strong").remove();
      const reward = $(li).text().trim().replace(/\(\s*\)/g, '').replace(/^:\s*/, '').trim();

      if (code) data.Active.push({ Code: code, Reward: reward, isNew });
    });

    $(".wp-block-list.is-style-inline-divider-list li").each((_, li) => {
      $(li).find("mark").remove();
      const text = $(li).text().trim();
      if (text) data.Expire.push(text);
    });

    return NextResponse.json({
      data: {
        Name: name,
        Total: { Active: data.Active.length, Expire: data.Expire.length },
        ...data,
        metadata: {
          Discord: "https://discord.gg/KA7Y9P4Jss",
          Version: 1.1,
          Time: new Date().toISOString(),
          apiServe
        }
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch codes', details: err.message }, { status: 500 });
  }
}
