"use client";

import { useState } from "react";
import type { PlatformData } from "@/lib/types";
import HotItem from "./HotItem";
import OrbitalRings from "./OrbitalRings";

const PREVIEW_COUNT = 10;

interface Props {
  data: PlatformData;
  /** 未筛选的原始数据，用于显示匹配计数 */
  originalData?: PlatformData;
  index?: number;
  /** 当前激活的分类，"全部"时不显示标记 */
  activeCategory?: string;
}

export default function PlatformCard({ data, originalData, index = 0, activeCategory }: Props) {
  const { name, color, items, error } = data;
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const hiddenCount = items.length - PREVIEW_COUNT;
  const totalCount = originalData?.items.length ?? items.length;
  const isFiltering = activeCategory && activeCategory !== "全部";
  const noMatch = isFiltering && items.length === 0 && totalCount > 0;

  return (
    /* 第 1 层：漂浮 */
    <div
      className={index === 1 ? "animate-float-slower" : "animate-float-slow"}
      style={{ animationDelay: `${index * 0.5}s`, animationDuration: `${5 + index * 1.5}s` }}
    >
      {/* 第 2 层：入场 */}
      <div
        className="animate-card-in"
        style={{ animationDelay: `${0.15 + index * 0.12}s` }}
      >
        {/* 第 3 层：观景窗 */}
        <div
          className="group/card relative rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "rgba(8, 10, 24, 0.55)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            boxShadow: [
              `0 0 0 1px rgba(255,255,255,0.06)`,
              `0 0 0 3px ${color}08`,
              `0 0 60px ${color}10`,
              `0 0 120px ${color}06`,
              `inset 0 1px 0 rgba(255,255,255,0.03)`,
              `inset 0 0 40px ${color}05`,
            ].join(", "),
          }}
        >
          {/* 轨道粒子环 */}
          <OrbitalRings color={color} />

          {/* 外层呼吸光晕 */}
          <div
            className="absolute -inset-1 rounded-2xl pointer-events-none breathe-glow"
            style={{
              background: `radial-gradient(ellipse at center, ${color}15 0%, transparent 70%)`,
              filter: "blur(8px)",
              zIndex: -1,
            }}
          />

          {/* 观景窗顶部框架装饰线 */}
          <div
            className="absolute top-0 left-0 right-0 h-px z-10 opacity-40 group-hover/card:opacity-70 transition-opacity duration-700"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${color}40 20%, ${color}70 50%, ${color}40 80%, transparent 95%)`,
            }}
          />
          <div
            className="absolute top-0.5 left-0 right-0 h-px z-10 opacity-25"
            style={{
              background: `linear-gradient(90deg, transparent 15%, ${color}30 40%, ${color}50 50%, ${color}30 60%, transparent 85%)`,
            }}
          />

          {/* 四个角的小螺钉/铆钉装饰 */}
          {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} w-1.5 h-1.5 rounded-full z-20 opacity-30 group-hover/card:opacity-50 transition-opacity duration-700`}
              style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
            />
          ))}

          {/* 头部 */}
          <div
            className="relative z-10 flex items-center gap-2.5 px-5 py-4 border-b"
            style={{ borderColor: `${color}12` }}
          >
            {/* 小星点 */}
            <div className="relative">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}, 0 0 16px ${color}60`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-pulse-glow"
                style={{ backgroundColor: color }}
              />
            </div>

            <h2
              className="text-sm font-semibold tracking-[0.15em] uppercase"
              style={{
                color: "#e0e0e0",
                textShadow: `0 0 24px ${color}30, 0 0 8px ${color}20`,
                letterSpacing: "0.2em",
              }}
            >
              {name}
            </h2>

            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-mono ml-auto"
              style={{
                backgroundColor: `${color}10`,
                color,
                border: `1px solid ${color}20`,
              }}
            >
              {isFiltering ? `${items.length}/${totalCount}` : items.length}
            </span>
          </div>

          {/* 列表区 */}
          <div className="relative z-10 flex-1 px-2 py-2 scrollbar-thin overflow-y-auto">
            {error ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                {noMatch ? (
                  <>
                    <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className="text-xs text-gray-500 tracking-wider">此分类下暂无内容</p>
                  </>
                ) : (
                  <>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 tracking-wider uppercase">接收信号中...</p>
                  </>
                )}
              </div>
            ) : (
              <>
                {visible.map((item) => (
                  <HotItem key={`${item.rank}-${item.title}`} item={item} color={color} />
                ))}

                {hiddenCount > 0 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-1
                               text-xs rounded-lg transition-all duration-300 hover:bg-white/[0.03]"
                    style={{ color: `${color}88` }}
                  >
                    <span className="tracking-wider">
                      {expanded ? "收起信号" : `展开全部信号 (${hiddenCount})`}
                    </span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-500 ${expanded ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
