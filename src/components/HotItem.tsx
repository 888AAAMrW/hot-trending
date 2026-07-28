"use client";

import type { HotItem as HotItemType } from "@/lib/types";

function rankBadge(rank: number, color: string) {
  if (rank === 1)
    return (
      <span className="relative inline-flex items-center justify-center w-5 h-5">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 animate-spin-slow" />
        <span className="absolute inset-[1.5px] rounded-full bg-[#050810]" />
        <span className="relative text-[10px] font-bold bg-gradient-to-br from-yellow-200 to-amber-400 bg-clip-text text-transparent">
          1
        </span>
      </span>
    );
  if (rank === 2)
    return (
      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-300 to-slate-500">
        <span className="text-[10px] font-bold text-white">2</span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-[10px] font-bold text-white">
        3
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] text-gray-600 font-mono">
      {rank}
    </span>
  );
}

export default function HotItem({ item, color }: { item: HotItemType; color: string }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/item flex items-center gap-2.5 px-2.5 py-2 rounded-md
                 transition-all duration-300 ease-out cursor-pointer
                 animate-item-in relative"
      style={{ animationDelay: `${item.rank * 0.03}s` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${color}08`;
        e.currentTarget.style.boxShadow = `inset 1px 0 0 ${color}20, 0 0 16px ${color}06`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* 排名 */}
      <div className="flex-shrink-0 w-5 flex justify-center">
        {rankBadge(item.rank, color)}
      </div>

      {/* 标题 */}
      <span className="flex-1 text-[13px] text-gray-400 group-hover/item:text-gray-200 truncate transition-colors duration-300 leading-snug">
        {item.title}
      </span>

      {/* 热度 */}
      {item.hotScore && (
        <span className="flex-shrink-0 text-[10px] font-mono tracking-tight text-gray-600 group-hover/item:text-gray-400 transition-colors duration-300">
          {item.hotScore}
        </span>
      )}

      {/* 信号箭头 */}
      <span className="flex-shrink-0 w-0 opacity-0 group-hover/item:opacity-60 group-hover/item:w-3 transition-all duration-300 text-gray-600 text-[10px] overflow-hidden">
        ›
      </span>
    </a>
  );
}
