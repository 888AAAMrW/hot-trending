// 留言板服务端存储
// Vercel KV 持久化 / 开发模式内存回退

import { kv } from "@vercel/kv";

export interface Reply {
  id: number;
  text: string;
  time: string;
}

export interface GuestbookMessage {
  id: number;
  name: string;
  text: string;
  time: string;
  pinned: boolean;
  likes: number;
  avatar?: string;
  isOwner: boolean;
  replies: Reply[];
}

const KV_KEY = "guestbook:messages";
const MAX_MESSAGES = 500;

function hasKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ====== 安全：输入清洗 ======

const BLOCKED_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /<iframe/i,
  /<embed/i,
  /<object/i,
];

function sanitize(input: string, maxLen: number): string {
  return input
    .slice(0, maxLen)
    .replace(/[<>]/g, "")  // 移除 HTML 标签字符
    .trim();
}

function containsAttack(text: string): boolean {
  return BLOCKED_PATTERNS.some((p) => p.test(text));
}

// ====== 读取 ======

export async function getMessages(): Promise<GuestbookMessage[]> {
  const msgs = await getAll();
  return sortMsgs(msgs).slice(0, 200);
}

// ====== 写入 ======

export async function addMessage(
  name: string,
  text: string,
  isOwner: boolean,
  avatar?: string,
): Promise<{ ok: true; message: GuestbookMessage } | { ok: false; error: string }> {
  // 安全检查
  if (containsAttack(text) || containsAttack(name)) {
    return { ok: false, error: "内容包含非法字符" };
  }

  const cleanName = sanitize(name, 20) || "不愿透露姓名的小可爱";
  const cleanText = sanitize(text, 500);

  if (!cleanText) {
    return { ok: false, error: "留言内容不能为空" };
  }

  const msg: GuestbookMessage = {
    id: Date.now(),
    name: cleanName,
    text: cleanText,
    time: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
    pinned: false,
    likes: 0,
    avatar: avatar?.startsWith("data:image/") ? avatar : undefined,
    isOwner,
    replies: [],
  };

  const all = await getAll();
  all.unshift(msg);
  if (all.length > MAX_MESSAGES) all.length = MAX_MESSAGES;
  await saveAll(all);

  return { ok: true, message: msg };
}

// ====== 删除 ======

export async function deleteMessage(id: number): Promise<void> {
  const all = await getAll();
  await saveAll(all.filter((m) => m.id !== id));
}

// ====== 置顶 ======

export async function togglePin(id: number): Promise<GuestbookMessage | null> {
  return updateOne(id, (m) => ({ ...m, pinned: !m.pinned }));
}

// ====== 点赞 ======

export async function toggleLike(
  id: number,
  clientKey: string,
): Promise<{ message: GuestbookMessage | null; liked: boolean }> {
  const likeKey = `guestbook:likes:${id}`;
  let alreadyLiked = false;

  if (hasKV()) {
    try { alreadyLiked = (await kv.sismember(likeKey, clientKey)) === 1; } catch {}
  } else {
    alreadyLiked = likeMem.get(id)?.has(clientKey) ?? false;
  }

  const delta = alreadyLiked ? -1 : 1;

  if (hasKV()) {
    try {
      alreadyLiked ? await kv.srem(likeKey, clientKey) : await kv.sadd(likeKey, clientKey);
    } catch {}
  }

  if (!alreadyLiked) {
    if (!likeMem.has(id)) likeMem.set(id, new Set());
    likeMem.get(id)!.add(clientKey);
  } else {
    likeMem.get(id)?.delete(clientKey);
  }

  const msg = await updateOne(id, (m) => ({ ...m, likes: m.likes + delta }));
  return { message: msg, liked: !alreadyLiked };
}

// ====== 回复（仅博主） ======

export async function addReply(id: number, text: string): Promise<GuestbookMessage | null> {
  if (containsAttack(text)) return null;
  const clean = sanitize(text, 300);
  if (!clean) return null;
  return updateOne(id, (m) => ({
    ...m,
    replies: [...m.replies, { id: Date.now(), text: clean, time: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) }],
  }));
}

// ====== 漂流瓶 ======

export async function getRandomMessage(): Promise<GuestbookMessage | null> {
  const all = await getAll();
  if (all.length === 0) return null;
  return all[Math.floor(Math.random() * all.length)];
}

// ====== 每日限流 ======

export async function checkDailyLimit(clientKey: string, maxPerDay = 5): Promise<{ allowed: boolean; remaining: number }> {
  const key = `guestbook:daily:${clientKey}`;
  if (hasKV()) {
    try {
      const count = await kv.incr(key);
      if (count === 1) await kv.expire(key, 86400);
      return { allowed: count <= maxPerDay, remaining: Math.max(0, maxPerDay - count) };
    } catch { return { allowed: true, remaining: maxPerDay }; }
  }
  const now = Date.now();
  if (!dailyMem.has(clientKey)) dailyMem.set(clientKey, []);
  const timestamps = dailyMem.get(clientKey)!.filter((t) => now - t < 86400000);
  dailyMem.set(clientKey, timestamps);
  const count = timestamps.length;
  if (count >= maxPerDay) return { allowed: false, remaining: 0 };
  timestamps.push(now);
  return { allowed: true, remaining: maxPerDay - count - 1 };
}

// ====== 速率限制（写操作） ======

const writeRateMap = new Map<string, number[]>();

export function checkWriteRate(clientKey: string, maxPerMinute = 10): boolean {
  const now = Date.now();
  if (!writeRateMap.has(clientKey)) writeRateMap.set(clientKey, []);
  const timestamps = writeRateMap.get(clientKey)!.filter((t) => now - t < 60000);
  writeRateMap.set(clientKey, timestamps);
  if (timestamps.length >= maxPerMinute) return false;
  timestamps.push(now);
  return true;
}

// ====== 内部 ======

async function getAll(): Promise<GuestbookMessage[]> {
  if (hasKV()) {
    try {
      const raw = await kv.lrange<GuestbookMessage>(KV_KEY, 0, -1);
      if (raw && raw.length > 0) return raw;
    } catch {}
  }
  return Array.from(memStore.values());
}

async function saveAll(msgs: GuestbookMessage[]) {
  msgs.forEach((m) => memStore.set(m.id, m));
  if (hasKV()) {
    try {
      await kv.del(KV_KEY);
      for (const m of [...msgs].reverse()) await kv.rpush(KV_KEY, m);
    } catch {}
  }
}

async function updateOne(
  id: number,
  fn: (m: GuestbookMessage) => GuestbookMessage,
): Promise<GuestbookMessage | null> {
  const all = await getAll();
  let found: GuestbookMessage | null = null;
  const updated = all.map((m) => {
    if (m.id === id) { found = fn(m); return found; }
    return m;
  });
  if (found) await saveAll(updated);
  return found;
}

function sortMsgs(msgs: GuestbookMessage[]): GuestbookMessage[] {
  return msgs.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.id - a.id;
  });
}

const memStore = new Map<number, GuestbookMessage>();
const likeMem = new Map<number, Set<string>>();
const dailyMem = new Map<string, number[]>();
