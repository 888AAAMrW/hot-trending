import type { HotItem, PlatformData } from "./types";

/** 通用请求头，模拟浏览器 */
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

/** 微博专用 Cookie（游客身份，绕过登录拦截） */
const WEIBO_COOKIE = "SUB=_2AkMuwKiSf8NxqwJRmP0dxGniaY9yww_EieKmjcT5JRMxHRl-yT9kqmkStRB6OeJUKTq1tDzM8NvON1-eBLh6m4iX67IX; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9Wh4Biq4_qUqUJ6EOq0K_h.75NHD95QfShM0e0z4eheRWs4DqcjMi--NiK.Xi-2Ri--ciKn7i-zN; _s_tentry=weibo.com; Apache=9213372484341.753.1754293175178; SINAGLOBAL=9213372484341.753.1754293175178; ULV=1754293175179:1:1:1:9213372484341.753.1754293175178:";

async function safeFetch(url: string, referer: string, extraHeaders?: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, Referer: referer, ...extraHeaders },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// ─── Weibo ────────────────────────────────────────────────

interface WeiboRawItem {
  word: string;
  raw_hot?: number;
  num?: number;
  url?: string;
  scheme?: string;
}

async function fetchWeibo(): Promise<PlatformData> {
  const data = (await safeFetch(
    "https://weibo.com/ajax/side/hotSearch",
    "https://weibo.com/",
    { Cookie: WEIBO_COOKIE },
  )) as { data?: { realtime?: WeiboRawItem[] } };

  const items: HotItem[] = (data?.data?.realtime ?? [])
    .slice(0, 25)
    .map((item: WeiboRawItem, i: number) => {
      const title = item.word ?? "";
      // 微博全站强制登录，用百度搜索替代，无需登录即可查看相关结果
      const url = `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`;
      const hotScore =
        item.raw_hot != null
          ? formatHot(item.raw_hot)
          : item.num != null
            ? formatHot(item.num)
            : null;

      return { rank: i + 1, title, url, hotScore };
    });

  return {
    platform: "weibo",
    name: "微博热搜",
    color: "#E6162D",
    items,
  };
}

// ─── Zhihu ─────────────────────────────────────────────────

interface ZhihuRawItem {
  target?: { id?: number; title?: string; url?: string };
  detail_text?: string;
}

async function fetchZhihu(): Promise<PlatformData> {
  const data = (await safeFetch(
    "https://api.zhihu.com/topstory/hot-list?limit=50",
    "https://www.zhihu.com/",
  )) as { data?: ZhihuRawItem[] };

  const items: HotItem[] = (data?.data ?? [])
    .filter((item) => item?.target?.title)
    .map((item, i) => {
      const target = item.target!;
      // 将 API URL 转为网页 URL
      const webUrl = target.url
        ? target.url.replace("api.zhihu.com/questions", "www.zhihu.com/question")
        : target.id
          ? `https://www.zhihu.com/question/${target.id}`
          : "";
      return {
        rank: i + 1,
        title: target.title ?? "",
        url: webUrl,
        hotScore: item.detail_text ?? null,
      };
    });

  return {
    platform: "zhihu",
    name: "知乎热榜",
    color: "#0066FF",
    items,
  };
}

// ─── Bilibili ──────────────────────────────────────────────

interface BilibiliRawItem {
  keyword?: string;
  show_name?: string;
  heat_score?: number;
}

async function fetchBilibili(): Promise<PlatformData> {
  const data = (await safeFetch(
    "https://api.bilibili.com/x/web-interface/wbi/search/square?limit=50",
    "https://www.bilibili.com/",
  )) as { code?: number; data?: { trending?: { list?: BilibiliRawItem[] } } };

  if (data?.code !== 0) {
    throw new Error(`Bilibili API returned code ${data?.code}`);
  }

  const list = data?.data?.trending?.list ?? [];

  const items: HotItem[] = list.map((item: BilibiliRawItem, i: number) => ({
    rank: i + 1,
    title: item.show_name ?? item.keyword ?? "",
    url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(item.keyword ?? "")}`,
    hotScore: item.heat_score != null ? formatHot(item.heat_score) : null,
  }));

  return {
    platform: "bilibili",
    name: "B站热搜",
    color: "#FB7299",
    items,
  };
}

// ─── Helpers ───────────────────────────────────────────────

function formatHot(num: number): string {
  if (num >= 1_0000_0000) return `${(num / 1_0000_0000).toFixed(1)}亿`;
  if (num >= 1_0000) return `${Math.round(num / 10000)}万`;
  if (num >= 1000) return `${Math.round(num / 1000)}k`;
  return String(num);
}

/** 并行抓取三平台，任一家失败不影响其他 */
export async function fetchAllPlatforms() {
  const results = await Promise.allSettled([
    fetchWeibo(),
    fetchZhihu(),
    fetchBilibili(),
  ]);

  const platforms: Record<string, PlatformData> = {};

  for (const r of results) {
    if (r.status === "fulfilled") {
      platforms[r.value.platform] = r.value;
    }
  }

  // 补上失败的平台
  for (const key of ["weibo", "zhihu", "bilibili"]) {
    if (!platforms[key]) {
      platforms[key] = {
        platform: key as PlatformData["platform"],
        name:
          key === "weibo" ? "微博热搜" : key === "zhihu" ? "知乎热榜" : "B站热搜",
        color:
          key === "weibo"
            ? "#E6162D"
            : key === "zhihu"
              ? "#0066FF"
              : "#FB7299",
        items: [],
        error: "暂时无法获取",
      };
    }
  }

  return { updatedAt: Date.now(), platforms };
}
