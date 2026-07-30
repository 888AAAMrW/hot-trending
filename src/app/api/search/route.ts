import { fetchAllPlatforms } from "@/lib/fetcher";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

function sanitize(text: string): string {
  return text
    .slice(0, 120)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[{}]/g, "「」")
    .replace(/```/g, "")
    .replace(/<\/?[a-zA-Z]+>/g, "")
    .trim();
}

export async function GET(request: Request) {
  // 限流：10 req / 60s / IP（AI 搜索较贵）
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`search:${clientKey}`, 10, 60_000);
  if (!rate.allowed) {
    return Response.json(
      { error: "搜索请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rate.reset - Date.now()) / 1000)),
        },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query || query.length < 1 || query.length > 50) {
    return Response.json({ error: "请输入 1-50 个字符的搜索词" }, { status: 400 });
  }

  // 获取当前热搜数据
  const data = await fetchAllPlatforms();

  // 构建标题列表
  const entries: { id: string; title: string; platform: string; rank: number }[] = [];
  for (const [key, pdata] of Object.entries(data.platforms)) {
    for (const item of pdata.items) {
      entries.push({
        id: `${key}:${item.rank}`,
        title: sanitize(item.title),
        platform: key,
        rank: item.rank,
      });
    }
  }

  if (entries.length === 0) {
    return Response.json({ query, results: [], cached: false });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    // Fallback：简单关键词匹配
    const q = query.toLowerCase();
    const results = entries
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 20)
      .map((e) => e.id);
    return Response.json({ query, results, cached: false, fallback: true });
  }

  // 构建 prompt
  const prompt = `用户搜索："${query}"

以下是所有热搜标题列表。请找出与搜索词语义相关的结果（理解含义，不只是字面匹配）。例如搜索"手机"应匹配"iPhone""华为""折叠屏"等。

**重要：只返回真正相关的，宁缺毋滥。如果没有任何标题与搜索词相关，直接输出「无」。**

返回格式：每行一个编号，按相关度从高到低排列，最多 20 条。只输出编号或「无」，不要解释。

${entries.map((e, i) => `${i}. ${e.title}`).join("\n")}`;

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              '你是一个严格的语义搜索引擎。根据用户搜索意图，从标题列表中找出真正语义相关的结果。宁缺毋滥——如果没有真正相关的，直接输出「无」。只输出编号或「无」，每行一个，按相关度排序。最多 20 条。不要任何解释。',
          },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`DeepSeek search API error: ${res.status}`);
      // Fallback
      const q = query.toLowerCase();
      const results = entries
        .filter((e) => e.title.toLowerCase().includes(q))
        .slice(0, 20)
        .map((e) => e.id);
      return Response.json({ query, results, cached: false, fallback: true });
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json?.choices?.[0]?.message?.content ?? "";

    // 解析编号
    const indices = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d+$/.test(line))
      .map(Number)
      .filter((i) => i >= 0 && i < entries.length)
      .slice(0, 20);

    const results = indices.map((i) => entries[i].id);

    return Response.json(
      { query, results, cached: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        },
      },
    );
  } catch (e) {
    console.error("AI search failed:", (e as Error).message);
    // Fallback
    const q = query.toLowerCase();
    const results = entries
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 20)
      .map((e) => e.id);
    return Response.json({ query, results, cached: false, fallback: true });
  }
}
