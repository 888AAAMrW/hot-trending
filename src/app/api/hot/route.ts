import { fetchAllPlatforms } from "@/lib/fetcher";
import type { PlatformData } from "@/lib/types";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { CATEGORY_KEYS } from "@/lib/categories";

const MAX_TITLE_LENGTH = 120;

/** 过滤标题中的控制字符和 prompt 注入标记 */
function sanitizeTitle(title: string): string {
  return title
    .slice(0, MAX_TITLE_LENGTH) // 截断过长标题
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // 去除控制字符（保留 \t \n）
    .replace(/[{}]/g, "「」") // 替换花括号，防止 JSON/prompt 模板注入
    .replace(/```/g, "") // 移除代码块标记
    .replace(/<\/?[a-zA-Z]+>/g, "") // 移除 HTML 标签
    .trim();
}

/** 用 DeepSeek 对一批标题批量分类 */
async function classifyWithAI(titles: string[]): Promise<string[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn("DEEPSEEK_API_KEY not set, falling back to keyword classification");
    return titles.map(() => "其他");
  }

  const prompt = `将以下热搜标题分类到最匹配的领域。只能从以下类别中选择：${CATEGORY_KEYS.join("、")}、其他。

规则：
- 财经：股票、基金、经济、货币政策、房价、企业财报、商业等
- 科技：AI、芯片、互联网公司、数码产品、航天、新能源等
- 教育：高考、大学、考研、学校、留学、考试、公务员等
- 游戏：电子游戏、电竞、游戏产业、动漫二次元、漫展等
- 影视：电影、电视剧、综艺节目、纪录片、短剧等
- 音乐：歌曲、演唱会、歌手、乐队、音乐节等
- 娱乐：明星八卦、网红、搞笑段子、粉丝追星等（注意：游戏/影视/音乐有独立分类）
- 美食：烹饪、餐厅、小吃、饮食文化、食品安全等
- 时尚：穿搭、美妆、潮流、奢侈品、减肥塑形等
- 萌宠：猫狗宠物、野生动物、动物趣闻等
- 体育：足球篮球等赛事、运动员、健身、马拉松等
- 汽车：汽车、新能源车、驾驶、驾照考试、油价等
- 健康：医疗、疾病、养生、心理健康、医美整容、疫情等
- 国际：外国政治、国际关系、外交、战争、移民等
- 社会：政策法规、公共安全、民生、交通、环保、天气灾害等
- 科普：科学、历史、人文、冷知识、哲学心理学等
- 其他：无法归入以上任何类别的内容

请严格按顺序输出每条的类别，每行一个，不要编号、不要解释，只输出类别名。

${titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

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
          { role: "system", content: "你是一个中文热搜分类助手。只输出类别名，每行一个。不做任何解释。" },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`DeepSeek API error: ${res.status} ${res.statusText}`);
      return titles.map(() => "其他");
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json?.choices?.[0]?.message?.content ?? "";
    const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);

    // 匹配到有效的类别
    const validCats = [...CATEGORY_KEYS, "其他"];
    return titles.map((_, i) => {
      const raw = lines[i] ?? "其他";
      for (const cat of validCats) {
        if (raw.includes(cat)) return cat;
      }
      return "其他";
    });
  } catch (e) {
    console.error("DeepSeek classification failed:", (e as Error).message);
    return titles.map(() => "其他");
  }
}

export async function GET(request: Request) {
  // ── 限流：30 req / 60s / IP ──
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(clientKey, 30, 60_000);
  if (!rate.allowed) {
    return Response.json(
      { error: "请求过于频繁，请稍后再试" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rate.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": "30",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rate.reset / 1000)),
        },
      },
    );
  }

  const data = await fetchAllPlatforms();

  // 收集所有标题（先做 sanitize）
  const allTitles: { platform: string; index: number; title: string }[] = [];
  for (const [, pdata] of Object.entries(data.platforms)) {
    for (let i = 0; i < pdata.items.length; i++) {
      const rawTitle = pdata.items[i].title;
      allTitles.push({ platform: pdata.platform, index: i, title: sanitizeTitle(rawTitle) });
    }
  }

  // AI 分类（使用已 sanitize 的标题）
  const titles = allTitles.map((t) => t.title);
  const categories = await classifyWithAI(titles);

  // 回填分类到各 item
  for (let i = 0; i < allTitles.length; i++) {
    const { platform, index } = allTitles[i];
    const pdata = data.platforms[platform] as PlatformData;
    if (pdata?.items[index]) {
      pdata.items[index] = { ...pdata.items[index], category: categories[i] ?? "其他" };
    }
  }

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      "X-RateLimit-Limit": "30",
      "X-RateLimit-Remaining": String(rate.remaining),
      "X-RateLimit-Reset": String(Math.ceil(rate.reset / 1000)),
    },
  });
}
