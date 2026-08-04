// 在线文章存储 — Vercel KV

import { kv } from "@vercel/kv";

const KV_KEY = "articles:list";

export interface KVArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string; // markdown
  tags: string[];
  date: string; // ISO
  updated?: string;
  draft: boolean;
}

export async function getArticles(): Promise<KVArticle[]> {
  try {
    const data = await kv.get<KVArticle[]>(KV_KEY);
    return (data || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<KVArticle | null> {
  const articles = await getArticles();
  return articles.find((a) => a.slug === slug) || null;
}

export async function createArticle(a: Omit<KVArticle, "id" | "date">): Promise<KVArticle> {
  const articles = await getArticles();
  const article: KVArticle = {
    ...a,
    id: String(Date.now()),
    date: new Date().toISOString(),
  };
  await kv.set(KV_KEY, [article, ...articles]);
  return article;
}

export async function updateArticle(id: string, updates: Partial<KVArticle>): Promise<KVArticle | null> {
  const articles = await getArticles();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  articles[idx] = { ...articles[idx], ...updates, updated: new Date().toISOString() };
  await kv.set(KV_KEY, articles);
  return articles[idx];
}

export async function deleteArticle(id: string): Promise<void> {
  const articles = await getArticles();
  await kv.set(KV_KEY, articles.filter((a) => a.id !== id));
}
