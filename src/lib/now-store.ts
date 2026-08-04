// NowCard 公开状态存储 — Vercel KV

import { kv } from "@vercel/kv";

const KV_KEY = "now:status";

export interface NowStatus {
  doing: string;
  mode: string; // "code" | "write" | "chill" | "night" | "away"
}

const DEFAULT: NowStatus = {
  doing: "在深空漂浮中…",
  mode: "code",
};

export async function getNowStatus(): Promise<NowStatus> {
  try {
    const data = await kv.get<NowStatus>(KV_KEY);
    return data ?? DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export async function setNowStatus(status: Partial<NowStatus>): Promise<NowStatus> {
  const current = await getNowStatus();
  const updated = { ...current, ...status };
  try {
    await kv.set(KV_KEY, updated);
  } catch {}
  return updated;
}
