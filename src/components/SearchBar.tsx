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
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items
      .filter((item) => item.title.toLowerCase().includes(q))
      .slice(0, 20);
  }, [items, query]);

  const show = focused && query.trim().length > 0;

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
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {results.length} 条结果
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

/** 在标题中高亮匹配的文字 */
function highlightMatch(title: string, query: string): React.ReactNode {
  const idx = title.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return title;
  const before = title.slice(0, idx);
  const match = title.slice(idx, idx + query.length);
  const after = title.slice(idx + query.length);
  return (
    <>
      {before}
      <mark style={{ background: "rgba(255,200,50,0.25)", color: "#ffe484", borderRadius: 2, padding: "0 1px" }}>{match}</mark>
      {after}
    </>
  );
}
