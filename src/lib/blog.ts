import { posts as velitePosts } from "../../.velite/index.js";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  draft: boolean;
  content: string;
};

export const posts = velitePosts as Post[];

/** 获取所有已发布文章（按日期倒序） */
export function getPublishedPosts(): Post[] {
  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** 按 slug 查找单篇文章 */
export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug && !p.draft);
}

/** 获取所有标签及文章计数（按计数降序） */
export function getAllTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    if (p.draft) continue;
    for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1);
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/** 按标签过滤已发布文章 */
export function getPostsByTag(tag: string): Post[] {
  return getPublishedPosts().filter((p) => p.tags.includes(tag));
}
