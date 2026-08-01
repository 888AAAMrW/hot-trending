import { getPublishedPosts } from "@/lib/blog";

export async function GET() {
  const published = getPublishedPosts();
  const siteUrl = "https://blog.starrynova.cc";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Starry Nova 博客</title>
    <link>${siteUrl}</link>
    <description>技术笔记 · 思考碎片 · 星际日志</description>
    <language>zh-CN</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${published
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map((t) => `<category>${t}</category>`).join("\n      ")}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
