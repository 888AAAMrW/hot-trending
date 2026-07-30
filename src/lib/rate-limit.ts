/**
 * 简易内存限流器 — 基于滑动窗口，无需外部依赖。
 *
 * Vercel Hobby 限制：
 *   Serverless Function: 100 GB-hr/月
 *   Edge Middleware:     100 万次/月
 *
 * 当前配置（保守，个人站点足够）：
 *   API:  30 req / 60s / IP（正常浏览大约每分钟 1 次 SWR 刷新）
 *   Page: 100 req / 60s / IP
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

/** 清理过期条目，每 5 分钟运行一次 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const expireBefore = now - 120_000; // 2 分钟前的记录全清
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > expireBefore);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * 检查是否超过限流阈值。
 * @returns { allowed: boolean; remaining: number; reset: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; reset: number } {
  cleanup();

  const now = Date.now();
  const windowStart = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // 移除窗口外的旧记录
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  const count = entry.timestamps.length;

  if (count >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const reset = oldestInWindow + windowMs;
    return { allowed: false, remaining: 0, reset };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: maxRequests - count - 1, reset: now + windowMs };
}

/** 从请求中提取客户端标识（优先 X-Forwarded-For，其次 IP） */
export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For 可能包含多个 IP（client, proxy1, proxy2...），取第一个
    return forwarded.split(",")[0].trim();
  }
  // Vercel 也会提供 x-real-ip
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
