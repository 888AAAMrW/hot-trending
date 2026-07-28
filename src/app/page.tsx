"use client";

import { useState } from "react";
import useSWR from "swr";
import Starfield from "@/components/Starfield";
import Header from "@/components/Header";
import PlatformCard from "@/components/PlatformCard";
import PlatformTabs from "@/components/PlatformTabs";
import type { TrendsResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ORDER: Array<"weibo" | "zhihu" | "bilibili"> = ["weibo", "zhihu", "bilibili"];

export default function Home() {
  const [mobileTab, setMobileTab] = useState<"weibo" | "zhihu" | "bilibili">("weibo");

  const { data, error, isValidating, mutate } = useSWR<TrendsResponse>(
    "/api/hot",
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
    },
  );

  const platforms = data?.platforms;

  return (
    <div className="relative min-h-screen">
      {/* 星空粒子背景 */}
      <Starfield />

      {/* 内容层 */}
      <div className="relative z-10">
        <Header
          updatedAt={data?.updatedAt ?? null}
          onRefresh={() => mutate()}
          loading={isValidating}
        />

        {/* ─── 移动端标签栏（lg 以下显示） ─── */}
        {platforms && (
          <PlatformTabs active={mobileTab} onChange={setMobileTab} platforms={platforms} />
        )}

        <main className="flex-1 max-w-7xl mx-auto px-4 pb-12 w-full">
          {error && !data ? (
            /* 首次加载失败 */
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-3">
              <svg className="w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm">无法加载热搜数据</p>
              <button
                onClick={() => mutate()}
                className="px-4 py-2 text-sm rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                点击重试
              </button>
            </div>
          ) : !data ? (
            /* 首次加载中 */
            <>
              {/* 移动端骨架 */}
              <div className="lg:hidden">
                <SkeletonMobileCard />
              </div>
              {/* 桌面端骨架 */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-5">
                {ORDER.map((key) => (
                  <SkeletonCard key={key} />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* ─── 桌面端三列网格（lg 及以上显示） ─── */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-5">
                {ORDER.map((key, i) => (
                  <PlatformCard key={key} data={data.platforms[key]} index={i} />
                ))}
              </div>
            </>
          )}

          {/* 底部 */}
          <footer className="mt-8 lg:mt-12 text-center text-xs text-gray-700">
            数据来源：知乎热榜 · B站热搜 · 微博热搜 &nbsp;|&nbsp; 每 60 秒自动刷新
          </footer>
        </main>
      </div>
    </div>
  );
}

/** 桌面端骨架屏 */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse flex flex-col"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-white/10" />
        <div className="h-4 w-20 rounded bg-white/8" />
      </div>
      <div className="px-5 py-4 space-y-3">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-4 rounded bg-white/5" />
            <div className="flex-1 h-3.5 rounded bg-white/5" />
            <div className="w-10 h-3 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 移动端骨架屏 */
function SkeletonMobileCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse mx-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/8" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 min-h-[48px]">
            <div className="w-6 h-5 rounded bg-white/5" />
            <div className="flex-1 h-4 rounded bg-white/5" />
            <div className="w-10 h-3 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
