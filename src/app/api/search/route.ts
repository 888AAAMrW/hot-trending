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
  const prompt = `用户搜索：「${query}」

理解用户真正想找什么。相关性不是字面匹配，而是理解搜索背后的意图：
- 同义词和别称：「手机」→ iPhone、华为Mate、折叠屏、智能手机
- 上下位概念：「新能源车」→ 比亚迪、特斯拉、蔚来、电动车
- 事件关联：「股市大跌」→ 熔断、熊市、A股、沪指、暴跌
- 人物关联：「特朗普」→ 美国总统、白宫、共和党、大选
- 缩写和全称：「AI」→ 人工智能、大模型、ChatGPT、GPT

**宁缺毋滥。如果没有真正相关的标题，输出「无」。**
**只输出编号（每行一个，最多20）或「无」。不要解释。**

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
              '你是一个智能搜索引擎，专门理解中文搜索意图。你的任务是根据用户搜索词，从热搜列表中找出真正相关的结果。相关性判断依据：同义词、别称、上下位概念、事件关联、人物关联、缩写全称映射。宁缺毋滥——不相关的绝不要硬凑。只输出编号或「无」，不要解释。',
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
