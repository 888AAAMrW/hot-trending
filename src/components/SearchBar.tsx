"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { PLATFORM_META } from "@/lib/types";
import type { HotItem, PlatformId } from "@/lib/types";

interface SearchableItem extends HotItem {
  platformId: PlatformId;
}

interface Props {
  items: SearchableItem[];
}

export default function SearchBar({ items }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIds, setAiIds] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 重置 AI 结果当搜索词改变
  useEffect(() => { setAiIds(null); }, [query]);

  const fuzzyResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    const scored: { item: SearchableItem; score: number }[] = [];
    for (const item of items) {
      const s = matchScore(item.title, q);
      if (s > 0) scored.push({ item, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 20).map((s) => s.item);
  }, [items, query]);

  // 合并结果：AI 优先，否则用模糊搜索
  const results = aiIds
    ? aiIds.map((id) => items.find((i) => `${i.platformId}:${i.rank}` === id)).filter(Boolean) as SearchableItem[]
    : fuzzyResults;

  const show = focused && query.trim().length > 0;

  // AI 语义搜索
  async function doAISearch() {
    if (!query.trim() || aiLoading) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAiLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { results: string[]; fallback?: boolean };
      if (!controller.signal.aborted) {
        setAiIds(data.results);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("AI search failed:", e);
      }
    } finally {
      if (!controller.signal.aborted) setAiLoading(false);
    }
  }

  // 点击外部关闭
  useEffect(() => {
    if (!show) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || inputRef.current?.contains(target)) return;
      setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show]);

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Ctrl+K / Cmd+K 打开搜索
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors"
          style={{ color: focused ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="搜索热搜…"
          className="w-48 md:w-56 pl-7.5 pr-3 py-1.5 text-xs rounded-lg transition-all duration-200 outline-none border"
          style={{
            background: focused
              ? "var(--color-surface-elevated)"
              : "rgba(255,255,255,0.03)",
            borderColor: focused
              ? "var(--color-border-accent)"
              : "rgba(255,255,255,0.06)",
            color: "var(--color-text-primary)",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setFocused(false); inputRef.current?.blur(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300"
          >
            ✕
          </button>
        )}
        {!focused && !query && (
          <kbd
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded pointer-events-none hidden md:block"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "var(--color-text-muted)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* 结果面板 */}
      {show && (
        <div
          ref={panelRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden animate-popover-in popover-surface max-h-80 overflow-y-auto scrollbar-thin"
        >
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
              未找到相关热搜
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-[10px] uppercase tracking-wider flex-1"
                  style={{ color: "var(--color-text-muted)" }}>
                  {aiIds ? "AI 语义匹配" : "即时搜索"} · {results.length} 条
                </span>
                {!aiIds && (
                  <button
                    onClick={doAISearch}
                    disabled={aiLoading}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-200 border"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      borderColor: "rgba(139,92,246,0.3)",
                      color: "#a78bfa",
                    }}
                  >
                    {aiLoading ? (
                      <>
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        搜索中
                      </>
                    ) : (
                      <>
                        <span className="text-xs">✨</span> AI 深度搜索
                      </>
                    )}
                  </button>
                )}
                {aiIds && (
                  <button
                    onClick={() => setAiIds(null)}
                    className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    返回即时搜索
                  </button>
                )}
              </div>
              {results.map((item) => {
                const meta = PLATFORM_META[item.platformId];
                return (
                  <a
                    key={`${item.platformId}-${item.rank}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { setQuery(""); setFocused(false); }}
                    className="flex items-center gap-2.5 px-3 py-2 transition-all duration-150 hover:border-l-2 group"
                    style={{
                      borderLeft: "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderLeftColor = meta.color;
                      e.currentTarget.style.background = "var(--color-surface-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderLeftColor = "transparent";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span className="flex-shrink-0 text-xs">{meta.emoji}</span>
                    <span className="flex-1 text-[13px] truncate group-hover:text-white transition-colors"
                      style={{ color: "var(--color-text-secondary)" }}>
                      {highlightMatch(item.title, query)}
                    </span>
                    <span className="flex-shrink-0 text-[10px] font-mono"
                      style={{ color: "var(--color-text-muted)" }}>
                      #{item.rank}
                    </span>
                  </a>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 模糊匹配得分：
 * - 精确子串匹配 → 1000 分（最高）
 * - 字符按序出现（子序列匹配，如 "ai" 匹配 "人工智能AI"） → 基于紧凑度评分
 * - 不匹配 → 0
 */
function matchScore(title: string, query: string): number {
  const t = title.toLowerCase();
  const q = query.toLowerCase();

  // 精确子串匹配 → 最高分（越靠前分越高）
  const exact = t.indexOf(q);
  if (exact !== -1) {
    return 1000 - exact;
  }

  // 子序列匹配（每个 query 字符在 title 中按序出现）
  let ti = 0;
  let first = -1;
  let last = -1;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    // 跳过空格
    if (ch === " ") { first = first === -1 ? ti : first; continue; }
    const found = t.indexOf(ch, ti);
    if (found === -1) return 0; // 有字符找不到 → 不匹配
    if (first === -1) first = found;
    last = found;
    ti = found + 1;
  }

  // 匹配越紧凑（字符间距越小），分数越高
  const span = last - first + 1;
  const density = q.length / span;
  return Math.round(density * 500);
}

/** 在标题中高亮匹配的文字 */
function highlightMatch(title: string, query: string): React.ReactNode {
  const t = title.toLowerCase();
  const q = query.toLowerCase();

  // 先尝试精确匹配高亮
  const exact = t.indexOf(q);
  if (exact !== -1) {
    const before = title.slice(0, exact);
    const match = title.slice(exact, exact + q.length);
    const after = title.slice(exact + q.length);
    return (
      <>
        {before}
        <mark className="search-highlight">{match}</mark>
        {after}
      </>
    );
  }

  // 子序列高亮：逐个字符高亮
  const result: React.ReactNode[] = [];
  let ti = 0;
  let keyIdx = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    if (ch === " ") continue;
    const found = t.indexOf(ch, ti);
    if (found === -1) break;
    if (found > ti) {
      result.push(<span key={keyIdx++}>{title.slice(ti, found)}</span>);
    }
    result.push(
      <mark key={keyIdx++} className="search-highlight">{title.slice(found, found + 1)}</mark>
    );
    ti = found + 1;
  }
  if (ti < title.length) {
    result.push(<span key={keyIdx++}>{title.slice(ti)}</span>);
  }
  return <>{result}</>;
}
