"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import Starfield from "@/components/Starfield";
import Header from "@/components/Header";
import { classifyTitle, CATEGORIES } from "@/lib/categories";
import { PLATFORM_META } from "@/lib/types";
import type { TrendsResponse, HotItem, PlatformId, PlatformData } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TaggedItem extends HotItem {
  platformId: PlatformId;
  category: string;
}

export default function Home() {
  const [category, setCategory] = useState("全部");
  const [platformFilter, setPlatformFilter] = useState<Set<PlatformId>>(new Set());
  const [stuck, setStuck] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, error, isValidating, mutate } = useSWR<TrendsResponse>(
    "/api/hot", fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false },
  );

  const platforms = data?.platforms;

  // ── 分类 + 分组 + Top 10 ──
  const { allTagged, categorySections, categoryCounts, top10 } = useMemo(() => {
    if (!platforms) return { allTagged: [], categorySections: [], categoryCounts: new Map(), top10: [] };

    const allItems: TaggedItem[] = [];
    const counts = new Map<string, number>();

    for (const [key, p] of Object.entries(platforms)) {
      for (const item of p.items) {
        const cat = classifyTitle(item.title);
        allItems.push({ ...item, platformId: key as PlatformId, category: cat });
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
    }
    counts.set("全部", allItems.length);

    // Top 10
    const sorted = [...allItems].sort((a, b) => {
      const ha = parseHot(a.hotScore); const hb = parseHot(b.hotScore);
      return hb - ha;
    });
    const top10 = sorted.slice(0, 10);

    // 按分类分组
    const groups = new Map<string, TaggedItem[]>();
    for (const item of allItems) {
      const c = item.category;
      if (!groups.has(c)) groups.set(c, []);
      groups.get(c)!.push(item);
    }

    // 构建板块列表：直接用 CATEGORIES 顺序，简单可靠
    const sections: { key: string; label: string; emoji: string; items: TaggedItem[] }[] = [];
    for (const cat of CATEGORIES) {
      if (cat.key === "全部") continue;
      if (category !== "全部" && cat.key !== category) continue; // 选具体分类时只保留该项
      const items = groups.get(cat.key);
      if (!items || items.length === 0) continue; // 无数据不显示
      sections.push({ key: cat.key, label: cat.label, emoji: cat.emoji, items });
    }

    return { allTagged: allItems, categorySections: sections, categoryCounts: counts, top10 };
  }, [platforms, category]);

  // ── Sticky sentinel ──
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setStuck(!e.isIntersecting),
      { threshold: [0] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Back-to-top visibility ──
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── 平台开关 ──
  const togglePlatform = (id: PlatformId) => {
    setPlatformFilter(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const filterActive = platformFilter.size > 0;
  const showAllPlatforms = !filterActive;

  return (
    <div className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10">
        <Header updatedAt={data?.updatedAt ?? null} onRefresh={() => mutate()} loading={isValidating} />

        {/* ── Sentinel: 检测滚动 ── */}
        <div ref={sentinelRef} className="h-px" />

        {/* ── 吸顶栏 ── */}
        {platforms && (
          <div className={[
            "z-30 transition-all duration-300",
            stuck
              ? "sticky top-0 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
              : "",
          ].join(" ")}>
            {/* 分类 pill */}
            <div className="max-w-6xl mx-auto px-4 pt-2 pb-1">
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat.key;
                  const count = categoryCounts.get(cat.key);
                  return (
                    <button key={cat.key} onClick={() => setCategory(cat.key)}
                      className={[
                        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                        "transition-all duration-250 border whitespace-nowrap active:scale-95",
                      ].join(" ")}
                      style={isActive ? {
                        background: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.28)",
                        color: "#fff", boxShadow: "0 0 18px rgba(255,255,255,0.06)",
                      } : {
                        background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.5)",
                      }}>
                      <span className="text-sm leading-none">{cat.emoji}</span>
                      <span>{cat.label}</span>
                      {count !== undefined && count > 0 && (
                        <span className={["text-[10px] px-1.5 py-0.5 rounded-full font-mono leading-none",
                          isActive ? "bg-white/15 text-white/70" : "bg-white/5 text-white/25"].join(" ")}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 平台开关（仅"全部"视图显示） */}
            {category === "全部" && (
              <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center gap-1.5 flex-wrap"
                style={{ scrollbarWidth: "none" }}>
                <span className="text-[10px] text-white/25 mr-1 flex-shrink-0">平台:</span>
                {Object.values(PLATFORM_META).map((m) => {
                  const on = showAllPlatforms || platformFilter.has(m.id);
                  return (
                    <button key={m.id} onClick={() => togglePlatform(m.id)}
                      className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px]
                                 transition-all duration-200 active:scale-90"
                      style={on ? {
                        background: `${m.color}20`, border: `1px solid ${m.color}50`, color: m.color,
                      } : {
                        background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.2)",
                      }}>
                      <span className="text-xs">{m.emoji}</span>
                      <span>{m.shortName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <main className="flex-1 max-w-6xl mx-auto px-4 pb-16 w-full">
          {error && !data ? (
            <ErrorState onRetry={() => mutate()} />
          ) : !data ? (
            <LoadingState />
          ) : (
            <>
              {/* ── Top 10 横幅 ── */}
              {category === "全部" && top10.length > 0 && (
                <div className="mt-4 mb-6">
                  <div className="flex items-center gap-2 mb-2.5 px-1">
                    <span className="text-sm">🔥</span>
                    <h2 className="text-xs font-semibold text-white/50 tracking-[0.2em] uppercase">
                      全平台热力 Top 10
                    </h2>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1"
                    style={{ scrollbarWidth: "none" }}>
                    {/* Top 10 水平滚动保留 — 卡片较大，换行会很难看 */}
                    {top10.map((item, i) => (
                      <Top10Card key={`${item.platformId}-${item.rank}`} item={item} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── 全部视图：平台卡片 ── */}
              {category === "全部" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(platforms!).map(([key, pdata]) => {
                    if (!showAllPlatforms && !platformFilter.has(key as PlatformId)) return null;
                    return <PlatformSection key={key} platformId={key as PlatformId} data={pdata} />;
                  })}
                </div>
              ) : categorySections.length === 0 ? (
                <EmptyState />
              ) : (
                /* ── 分类视图：领域聚合 ── */
                <div className="space-y-8 mt-3">
                  {categorySections.map((section) => (
                    <CategorySection key={section.key} cat={section} />
                  ))}
                </div>
              )}
            </>
          )}

          <footer className="mt-12 text-center text-[11px] text-gray-700">
            微博 · 知乎 · B站 · 抖音 · 百度 · 头条 · 小红书 &nbsp;|&nbsp; 每 60 秒刷新
          </footer>
        </main>
      </div>

      {/* ─── 回到顶部 ─── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={[
          "fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full",
          "flex items-center justify-center",
          "bg-white/10 hover:bg-white/20 backdrop-blur-xl",
          "border border-white/10 hover:border-white/20",
          "shadow-lg shadow-black/20",
          "transition-all duration-300",
          showBackTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
        aria-label="回到顶部"
      >
        <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  Top10Card
// ═══════════════════════════════════════════════════════

function Top10Card({ item, index }: { item: TaggedItem; index: number }) {
  const meta = PLATFORM_META[item.platformId];
  const flameColors = ["#FFD700", "#FFA500", "#FF6347"];
  const flame = flameColors[Math.min(index, 2)];

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      className="flex-shrink-0 w-56 rounded-xl p-3 transition-all duration-300
                 hover:scale-[1.03] hover:-translate-y-0.5 group relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
      {/* 热度渐变背景 */}
      <div className="absolute inset-0 opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
        style={{ background: `linear-gradient(135deg, ${flame}, transparent 70%)` }} />

      <div className="relative z-10 flex items-start gap-2.5">
        <span className="flex-shrink-0 text-lg font-bold"
          style={{ color: flame, textShadow: `0 0 12px ${flame}40` }}>
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {item.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: `${meta.color}18`, color: meta.color }}>
              {meta.shortName}
            </span>
            {item.hotScore && (
              <span className="text-[10px] font-mono text-white/30">{item.hotScore}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

// ═══════════════════════════════════════════════════════
//  PlatformSection（"全部"视图 = 单平台卡片）
// ═══════════════════════════════════════════════════════

function PlatformSection({ platformId, data }: { platformId: PlatformId; data: PlatformData }) {
  const meta = PLATFORM_META[platformId];
  const { items, error } = data;
  const [expanded, setExpanded] = useState(false);
  const preview = expanded ? items : items.slice(0, 8);
  const hiddenCount = items.length - 8;
  const maxHot = useMemo(() => Math.max(...items.map(i => parseHot(i.hotScore)), 1), [items]);

  return (
    <section
      className="rounded-2xl overflow-hidden animate-card-in group/section relative
                 transition-all duration-500 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(175deg, ${meta.color}08 0%, rgba(6,8,20,0.5) 30%, rgba(6,8,20,0.5) 100%)`,
        backdropFilter: "blur(24px) saturate(1.2)",
        boxShadow: [
          `0 0 0 1px rgba(255,255,255,0.05)`,
          `0 0 0 3px ${meta.color}06`,
          `0 4px 24px rgba(0,0,0,0.3)`,
          `0 0 60px ${meta.color}08`,
          `inset 0 1px 0 rgba(255,255,255,0.02)`,
        ].join(", "),
      }}>
      {/* 悬停外发光 */}
      <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover/section:opacity-100
                      transition-opacity duration-700 pointer-events-none -z-10"
        style={{ background: `radial-gradient(ellipse at center, ${meta.color}12 0%, transparent 70%)`, filter: "blur(12px)" }} />

      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-5 right-5 h-px opacity-40 group-hover/section:opacity-70 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.color}60 20%, ${meta.color}80 50%, ${meta.color}60 80%, transparent)` }} />

      {/* 角落装饰 */}
      <div className="absolute top-3 left-3 w-1 h-1 rounded-full opacity-20 group-hover/section:opacity-40 transition-opacity duration-500"
        style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
      <div className="absolute top-3 right-3 w-1 h-1 rounded-full opacity-20 group-hover/section:opacity-40 transition-opacity duration-500"
        style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />

      {/* 头部 */}
      <div className="relative flex items-center gap-3 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${meta.color}0D` }}>
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full blur-sm opacity-30"
            style={{ backgroundColor: meta.color }} />
          <span className="relative text-lg">{meta.emoji}</span>
        </div>
        <h2 className="text-sm font-semibold tracking-[0.12em] uppercase"
          style={{ color: "#e8e8e8", textShadow: `0 0 20px ${meta.color}20` }}>
          {meta.name}
        </h2>
        <div className="flex-1" />
        {/* 迷你趋势指示器 */}
        <div className="flex items-center gap-1 mr-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-0.5 rounded-full"
              style={{
                height: `${6 + i * 4}px`,
                backgroundColor: meta.color,
                opacity: 0.3 + i * 0.2,
              }} />
          ))}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
          style={{ backgroundColor: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}22` }}>
          {items.length}
        </span>
      </div>

      {/* 列表 */}
      {error ? (
        <div className="flex flex-col items-center py-12 text-gray-500 gap-1.5">
          <p className="text-xs">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2">
          <div className="flex gap-1">{[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ backgroundColor: meta.color, animationDelay: `${i*0.15}s` }} />
          ))}</div>
          <p className="text-[11px] text-gray-500 tracking-wider">接收信号中...</p>
        </div>
      ) : (
        <>
          <div className="divide-y" style={{ borderColor: `${meta.color}05` }}>
            {preview.map((item) => (
              <PlatformItem key={`${item.rank}`} item={item} color={meta.color} maxHot={maxHot} />
            ))}
          </div>
          {hiddenCount > 0 && (
            <button onClick={() => setExpanded(!expanded)}
              className="w-full py-2.5 text-xs tracking-wider transition-all duration-300
                         hover:bg-white/[0.02] active:bg-white/[0.04]"
              style={{ color: `${meta.color}80`, borderTop: `1px solid ${meta.color}08` }}>
              {expanded ? "▲ 收起" : `▼ 展开全部 (${hiddenCount} 条)`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════
//  PlatformItem（单条，带微型热度条）
// ═══════════════════════════════════════════════════════

function PlatformItem({ item, color, maxHot }: { item: HotItem; color: string; maxHot: number }) {
  const h = parseHot(item.hotScore);
  const barPct = maxHot > 0 ? Math.max(1, (h / maxHot) * 100) : 1;
  const isTop3 = item.rank <= 3;

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-3 py-2 transition-all duration-200
                 hover:bg-white/[0.04] group/item min-h-[42px] relative overflow-hidden">
      {/* 微型热度条 */}
      <div className="absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out"
        style={{
          width: `${Math.min(barPct, 100)}%`,
          background: isTop3
            ? `linear-gradient(90deg, ${color}15, ${color}04, transparent)`
            : `linear-gradient(90deg, ${color}08, ${color}02, transparent)`,
        }} />

      {/* 排名 */}
      <span className={[
        "flex-shrink-0 w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold relative z-10",
        item.rank === 1 ? "bg-gradient-to-br from-yellow-300 to-orange-500 text-white shadow-sm shadow-yellow-500/20" :
        item.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white" :
        item.rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white" :
        "text-gray-500 font-mono bg-transparent",
      ].join(" ")}
        style={item.rank <= 3 ? {} : { backgroundColor: `${color}08` }}>
        {item.rank}
      </span>

      {/* 标题 */}
      <span className="flex-1 text-[13px] text-gray-200 leading-snug truncate relative z-10
                       group-hover/item:text-white group-hover/item:translate-x-0.5 transition-all duration-200">
        {item.title}
      </span>

      {/* 热度 */}
      {item.hotScore && (
        <span className="flex-shrink-0 text-[10px] font-mono relative z-10"
          style={{ color: isTop3 ? `${color}aa` : "rgb(107,114,128)" }}>
          {item.hotScore}
        </span>
      )}
    </a>
  );
}

// ═══════════════════════════════════════════════════════
//  CategorySection（分类视图 = 跨平台聚合）
// ═══════════════════════════════════════════════════════

function CategorySection({ cat }: {
  cat: { key: string; label: string; emoji: string; items: TaggedItem[] };
}) {
  return (
    <section className="animate-card-in">
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <span className="text-lg">{cat.emoji}</span>
        <h2 className="text-sm font-semibold text-white/75 tracking-[0.12em] uppercase">{cat.label}</h2>
        <span className="text-[11px] text-white/25 font-mono">{cat.items.length} 条</span>
        <div className="flex-1 h-px ml-3"
          style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {cat.items.map((item, i) => (
          <CategoryFeedItem key={`${item.platformId}-${item.rank}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════
//  CategoryFeedItem（分类视图条目）
// ═══════════════════════════════════════════════════════

function CategoryFeedItem({ item }: { item: TaggedItem }) {
  const meta = PLATFORM_META[item.platformId];

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200
                 hover:bg-white/[0.04] group min-h-[40px]">
      <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium leading-none"
        style={{ backgroundColor: `${meta.color}14`, color: meta.color, border: `1px solid ${meta.color}25` }}>
        {meta.shortName}
      </span>
      <span className="flex-1 text-[13px] text-gray-200 leading-snug truncate
                       group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200">
        {item.title}
      </span>
      {item.hotScore && (
        <span className="flex-shrink-0 text-[10px] font-mono text-gray-500">{item.hotScore}</span>
      )}
    </a>
  );
}

// ═══════════════════════════════════════════════════════
//  States
// ═══════════════════════════════════════════════════════

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-gray-500 gap-4">
      <svg className="w-14 h-14 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className="text-sm">无法加载热搜数据</p>
      <button onClick={onRetry}
        className="px-5 py-2 text-sm rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
        重试
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-gray-500 gap-3">
      <svg className="w-10 h-10 opacity-15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <p className="text-sm">此分类下暂无热搜</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-7 rounded-full bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
            style={{ background: "rgba(255,255,255,0.015)", height: 320 }} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════

function parseHot(score: string | null): number {
  if (!score) return 0;
  if (score.endsWith("亿")) return parseFloat(score) * 100000000;
  if (score.endsWith("万") || score.endsWith("w")) return parseFloat(score) * 10000;
  if (score.endsWith("k")) return parseFloat(score) * 1000;
  return parseFloat(score) || 0;
}
