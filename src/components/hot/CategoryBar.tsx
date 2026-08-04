"use client";

import { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";

interface CategoryBarProps {
  category: string;
  categoryCounts: Map<string, number>;
  onSelect: (key: string) => void;
}

const TOP_DESKTOP = 6;
const TOP_MOBILE = 3;

export default function CategoryBar({ category, categoryCounts, onSelect }: CategoryBarProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || moreRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visibleCount = isMobile ? TOP_MOBILE : TOP_DESKTOP;
  const sorted = [...CATEGORIES]
    .filter((c) => c.key !== "全部")
    .sort((a, b) => (categoryCounts.get(b.key) ?? 0) - (categoryCounts.get(a.key) ?? 0));
  const primary = sorted.slice(0, visibleCount);
  const overflow = sorted.slice(visibleCount);

  const isActive = (key: string) => category === key;

  const pillClass = (active: boolean) =>
    [
      "flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium",
      "transition-all duration-200 border cursor-pointer",
      active
        ? "border-white/20"
        : "border-white/[0.06]",
    ].join(" ");

  const pillStyle = (active: boolean) =>
    active
      ? {
          background: "rgba(255,255,255,0.13)",
          color: "#fff",
          boxShadow: "0 0 18px rgba(255,255,255,0.06)",
        }
      : {
          background: "rgba(255,255,255,0.03)",
          color: "rgba(255,255,255,0.5)",
        };

  return (
    <div className="relative max-w-6xl mx-auto px-4 pt-2.5 pb-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* 全部 */}
        <button
          onClick={() => { onSelect("全部"); setOpen(false); }}
          className={pillClass(isActive("全部"))}
          style={pillStyle(isActive("全部"))}
        >
          <span className="text-sm leading-none">🌐</span>
          <span>全部</span>
        </button>

        {/* 主分类 */}
        {primary.map((cat) => {
          const active = isActive(cat.key);
          const count = categoryCounts.get(cat.key);
          if (count === 0 && !active) return null;
          return (
            <button
              key={cat.key}
              onClick={() => { onSelect(cat.key); setOpen(false); }}
              className={pillClass(active)}
              style={pillStyle(active)}
            >
              <span className="text-sm leading-none">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* 更多按钮 */}
        {overflow.length > 0 && (
          <button
            ref={moreRef}
            onClick={() => setOpen((v) => !v)}
            className={pillClass(open)}
            style={pillStyle(open)}
          >
            <span>{open ? "收起" : "更多"}</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* 弹出面板 */}
      {open && (
        <div
          ref={panelRef}
          className="absolute left-4 right-4 top-full mt-2 z-40 rounded-xl p-3 animate-popover-in popover-surface"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            {overflow.map((cat) => {
              const active = isActive(cat.key);
              return (
                <button
                  key={cat.key}
                  onClick={() => { onSelect(cat.key); setOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 border"
                  style={
                    active
                      ? {
                          background: "rgba(255,255,255,0.13)",
                          color: "#fff",
                          borderColor: "rgba(255,255,255,0.2)",
                        }
                      : {
                          background: "rgba(13,17,32,0.7)",
                          color: "rgba(255,255,255,0.45)",
                          borderColor: "rgba(255,255,255,0.05)",
                        }
                  }
                >
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="flex-1 text-left">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
