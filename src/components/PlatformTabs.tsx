"use client";

import { useRef, useCallback, useState } from "react";
import type { PlatformData } from "@/lib/types";

const PREVIEW_COUNT = 10;

const TABS = [
  { key: "weibo" as const, label: "微博", icon: "🔥" },
  { key: "zhihu" as const, label: "知乎", icon: "💡" },
  { key: "bilibili" as const, label: "B站", icon: "🎬" },
];

interface Props {
  active: string;
  onChange: (key: "weibo" | "zhihu" | "bilibili") => void;
  platforms: Record<string, PlatformData>;
}

export default function PlatformTabs({ active, onChange, platforms }: Props) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentIndex = TABS.findIndex((t) => t.key === active);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TABS.length - 1, index));
      onChange(TABS[clamped].key);
    },
    [onChange],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Only swipe if horizontal movement > vertical (avoid scroll conflicts)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      goTo(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }
  };

  return (
    <>
      {/* 标签栏 */}
      <div className="lg:hidden sticky top-0 z-20 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            const p = platforms[tab.key];
            const count = p?.items?.length ?? 0;
            const color = p?.color ?? "#666";

            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className="flex-1 flex flex-col items-center gap-1 py-3 px-2 relative
                           transition-colors duration-200 min-h-[56px]
                           active:bg-white/5"
              >
                <span className="text-lg">{tab.icon}</span>
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-1 text-[10px] opacity-60">({count})</span>
                  )}
                </span>
                {/* 激活指示条 */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 可滑动内容区（移动端） */}
      <div
        className="lg:hidden overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {TABS.map((tab) => {
            const p = platforms[tab.key];
            if (!p) return null;

            return (
              <div key={tab.key} className="w-full flex-shrink-0 px-4 pb-4">
                {/* 平台卡片（移动端全宽） */}
                <MobilePlatformCard data={p} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 滑动指示点 */}
      <div className="lg:hidden flex justify-center gap-1.5 pb-3">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => goTo(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-5 bg-white/60"
                : "bg-white/15 hover:bg-white/25"
            }`}
            aria-label={`切换到${tab.label}`}
          />
        ))}
      </div>
    </>
  );
}

/** 移动端专用卡片——整页宽、触摸优化 */
function MobilePlatformCard({ data }: { data: PlatformData }) {
  const { name, color, items, error } = data;
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hiddenCount = items.length - PREVIEW_COUNT;

  return (
    <div
      className="rounded-2xl overflow-hidden animate-card-in relative"
      style={{
        animationDelay: "0.1s",
        background: "rgba(8, 10, 24, 0.5)",
        backdropFilter: "blur(24px) saturate(1.3)",
        WebkitBackdropFilter: "blur(24px) saturate(1.3)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 0 3px ${color}06, 0 8px 32px rgba(0,0,0,0.5), 0 0 60px ${color}0D, inset 0 1px 0 rgba(255,255,255,0.02)`,
      }}
    >
      {/* 呼吸光晕 */}
      <div
        className="absolute -inset-1 rounded-2xl pointer-events-none breathe-glow"
        style={{
          background: `radial-gradient(ellipse at center, ${color}12 0%, transparent 70%)`,
          filter: "blur(6px)",
          zIndex: -1,
        }}
      />

      {/* 顶部光条 */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-10 opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${color}40 20%, ${color}60 50%, ${color}40 80%, transparent 95%)`,
        }}
      />
      {/* 卡片头部 */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5 border-b"
        style={{ borderColor: `${color}15` }}
      >
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <div
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{ backgroundColor: color }}
          />
        </div>
        <span className="text-sm font-bold text-white tracking-wide"
              style={{ textShadow: `0 0 18px ${color}40` }}>{name}</span>
        <span
          className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {items.length} 条
        </span>
      </div>

      {/* 列表 */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
          <p className="text-sm">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">加载中...</p>
        </div>
      ) : (
        <>
          <div className="divide-y" style={{ borderColor: `${color}08` }}>
            {visible.map((item) => (
              <MobileHotItem key={`${item.rank}-${item.title}`} item={item} color={color} />
            ))}
          </div>

          {/* 查看更多 */}
          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1.5 py-3.5
                         text-xs font-medium active:bg-white/5 transition-colors"
              style={{ color, borderTop: `1px solid ${color}10` }}
            >
              <span>
                {expanded ? "收起" : `查看更多 (${hiddenCount} 条)`}
              </span>
              <svg
                className={`w-3 h-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** 移动端专用条目——44px+ 触摸目标 */
function MobileHotItem({
  item,
  color,
}: {
  item: { rank: number; title: string; url: string; hotScore: string | null };
  color: string;
}) {
  const top3Color =
    item.rank === 1
      ? "bg-gradient-to-br from-yellow-300 to-orange-500 text-white"
      : item.rank === 2
        ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
        : item.rank === 3
          ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
          : "";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 active:bg-white/5
                 transition-colors duration-150 min-h-[48px] animate-item-in"
      style={{ animationDelay: `${item.rank * 0.04}s` }}
    >
      {/* 排名 */}
      {top3Color ? (
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${top3Color}`}
        >
          {item.rank}
        </span>
      ) : (
        <span className="flex-shrink-0 w-6 text-center text-[11px] text-gray-500 font-mono">
          {item.rank}
        </span>
      )}

      {/* 标题 */}
      <span className="flex-1 text-sm text-gray-200 leading-snug line-clamp-2">
        {item.title}
      </span>

      {/* 热度 + 箭头 */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {item.hotScore && (
          <span className="text-[11px] font-mono text-gray-500">{item.hotScore}</span>
        )}
        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}
