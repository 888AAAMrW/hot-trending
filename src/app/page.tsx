"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Starfield from "@/components/Starfield";
import Header from "@/components/Header";
import { classifyTitle, CATEGORIES } from "@/lib/categories";
import { PLATFORM_META } from "@/lib/types";
import type { TrendsResponse, HotItem, PlatformId } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** 带平台信息的热搜条目 */
interface TaggedItem extends HotItem {
  platformId: PlatformId;
  category: string;
}

export default function Home() {
  const [category, setCategory] = useState("全部");

  const { data, error, isValidating, mutate } = useSWR<TrendsResponse>(
    "/api/hot",
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false },
  );

  const platforms = data?.platforms;

  // ── 分类 + 分组 ──
  const { categorySections, categoryCounts } = useMemo(() => {
    if (!platforms) return { categorySections: [], categoryCounts: new Map<string, number>() };

    // 1. 把所有平台的所有条目打平，标注平台和分类
    const allItems: TaggedItem[] = [];
    const counts = new Map<string, number>();

    for (const [key, p] of Object.entries(platforms)) {
      for (const item of p.items) {
        const cat = classifyTitle(item.title);
        allItems.push({
          ...item,
          platformId: key as PlatformId,
          category: cat,
        });
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
    }

    // "全部" 总数
    counts.set("全部", allItems.length);

    // 2. 按分类分组
    const groups = new Map<string, TaggedItem[]>();
    for (const item of allItems) {
      const cat = item.category;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(item);
    }

    // 3. 构建分类板块列表（按匹配数降序）
    const targetCats = category === "全部"
      ? CATEGORIES.filter(c => c.key !== "全部" && c.key !== "其他")
      : CATEGORIES.filter(c => c.key === category);

    // 按匹配数排序，多的在前
    const sections = targetCats
      .filter(c => {
        if (category !== "全部") return true;
        return groups.has(c.key) && groups.get(c.key)!.length > 0;
      })
      .sort((a, b) => {
        const ca = groups.get(a.key)?.length ?? 0;
        const cb = groups.get(b.key)?.length ?? 0;
        return cb - ca;
      })
      .map(c => ({
        ...c,
        items: groups.get(c.key) ?? [],
      }));

    // "其他" 放最后
    const otherItems = groups.get("其他") ?? [];
    if (otherItems.length > 0 && (category === "全部" || category === "其他")) {
      const otherCat = CATEGORIES.find(c => c.key === "其他")!;
      sections.push({ ...otherCat, items: otherItems });
    }

    return { categorySections: sections, categoryCounts: counts };
  }, [platforms, category]);

  return (
    <div className="relative min-h-screen">
      <Starfield />

      <div className="relative z-10">
        <Header
          updatedAt={data?.updatedAt ?? null}
          onRefresh={() => mutate()}
          loading={isValidating}
        />

        {/* ─── 分类筛选栏 ─── */}
        {platforms && (
          <div className="mb-2">
            <div className="max-w-5xl mx-auto px-4">
              <div
                className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none"
                style={{ scrollbarWidth: "none" }}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat.key;
                  const count = categoryCounts.get(cat.key);

                  return (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={[
                        "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium",
                        "transition-all duration-300 border whitespace-nowrap",
                        "active:scale-95",
                      ].join(" ")}
                      style={
                        isActive
                          ? {
                              background: "rgba(255,255,255,0.12)",
                              borderColor: "rgba(255,255,255,0.25)",
                              color: "#fff",
                              boxShadow: "0 0 20px rgba(255,255,255,0.08)",
                            }
                          : {
                              background: "rgba(255,255,255,0.03)",
                              borderColor: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.55)",
                            }
                      }
                    >
                      <span className="text-sm leading-none">{cat.emoji}</span>
                      <span>{cat.label}</span>
                      {count !== undefined && count > 0 && (
                        <span
                          className={[
                            "text-[10px] px-1.5 py-0.5 rounded-full font-mono leading-none",
                            isActive ? "bg-white/15 text-white/70" : "bg-white/5 text-white/30",
                          ].join(" ")}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <style jsx>{`.scrollbar-none::-webkit-scrollbar{display:none}`}</style>
          </div>
        )}

        <main className="flex-1 max-w-5xl mx-auto px-4 pb-12 w-full">
          {error && !data ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-3">
              <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm">无法加载热搜数据</p>
              <button onClick={() => mutate()} className="px-4 py-2 text-sm rounded-full bg-white/5 hover:bg-white/10 border border-white/5">
                点击重试
              </button>
            </div>
          ) : !data ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(16px)" }}>
                  <div className="h-12 border-b border-white/5 flex items-center px-5">
                    <div className="w-24 h-4 rounded bg-white/8" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <div key={j} className="h-10 rounded bg-white/5" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ─── 分类板块 ─── */}
              {categorySections.length === 0 && category !== "全部" ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-3">
                  <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-sm">此分类下暂无热搜</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {categorySections.map((section) => (
                    <CategorySection key={section.key} cat={section} />
                  ))}
                </div>
              )}
            </>
          )}

          <footer className="mt-10 text-center text-xs text-gray-700">
            数据来源：微博 · 知乎 · B站 · 抖音 · 百度 · 头条 · 小红书 &nbsp;|&nbsp; 每 60 秒自动刷新
          </footer>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  CategorySection
// ═══════════════════════════════════════════════════════════

function CategorySection({ cat }: {
  cat: { key: string; label: string; emoji: string; items: TaggedItem[] };
}) {
  return (
    <section className="animate-card-in">
      {/* 标题栏 */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <span className="text-lg">{cat.emoji}</span>
        <h2 className="text-sm font-semibold text-white/80 tracking-wider uppercase">
          {cat.label}
        </h2>
        <span className="text-[11px] text-white/30 font-mono ml-2">
          {cat.items.length} 条
        </span>
        <div className="flex-1 h-px ml-3" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
      </div>

      {/* 条目网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {cat.items.map((item, i) => (
          <FeedItem key={`${item.platformId}-${item.rank}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
//  FeedItem — 单条热搜（统一信息流）
// ═══════════════════════════════════════════════════════════

function FeedItem({ item }: { item: TaggedItem }) {
  const meta = PLATFORM_META[item.platformId];

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200
                 hover:bg-white/[0.04] min-h-[44px]"
    >
      {/* 平台标签 */}
      <span
        className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium leading-none"
        style={{
          backgroundColor: `${meta.color}18`,
          color: meta.color,
          border: `1px solid ${meta.color}30`,
        }}
      >
        {meta.shortName}
      </span>

      {/* 标题 */}
      <span className="flex-1 text-sm text-gray-200 leading-snug truncate group-hover:text-white transition-colors">
        {item.title}
      </span>

      {/* 热度 */}
      {item.hotScore && (
        <span className="flex-shrink-0 text-[11px] font-mono text-gray-500">
          {item.hotScore}
        </span>
      )}
    </a>
  );
}
