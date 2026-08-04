"use client";

import { useState, useEffect } from "react";

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 5) return "刚刚";
  if (seconds < 60) return `${seconds} 秒前`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  return `${hours} 小时前`;
}

export default function Header({
  updatedAt,
  onRefresh,
  loading,
}: {
  updatedAt: number | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!updatedAt) return;
    setDisplay(timeAgo(updatedAt));
    const id = setInterval(() => setDisplay(timeAgo(updatedAt)), 10000);
    return () => clearInterval(id);
  }, [updatedAt]);

  return (
    <header className="flex flex-col items-center gap-1.5 pt-6 pb-4 px-4 animate-header-in">
      <a
        href="https://starrynova.cc"
        className="mb-1 text-xs tracking-wider transition-colors hover:text-gray-400"
        style={{ color: "var(--color-text-muted)" }}
      >
        ← 返回星际基地
      </a>
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
        <span>🔥</span> 实时热搜聚合
      </h1>
      <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
        七大主流平台 · 一站式实时热点追踪
      </p>
      <div className="flex items-center gap-3 mt-1.5">
        {updatedAt && (
          <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            更新于 {display}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full
                     transition-all duration-200 disabled:opacity-50 border"
          style={{
            background: "var(--color-surface-elevated)",
            borderColor: "var(--color-border-subtle)",
            color: "var(--color-text-secondary)",
          }}
        >
          <svg
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          刷新
        </button>
      </div>
    </header>
  );
}
