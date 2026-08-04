"use client";

import Link from "next/link";
import type { Post } from "@/lib/blog";

interface BlogCardProps {
  post: Post;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogCard({ post }: BlogCardProps) {
  const date = formatDate(post.date);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group/card backdrop-blur-xl rounded-2xl border p-6 md:p-7
                 transition-all duration-300"
      style={{
        background: "rgba(10,8,25,0.50)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 0 40px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(12,10,28,0.62)";
        e.currentTarget.style.borderColor = "rgba(251,191,36,0.22)";
        e.currentTarget.style.boxShadow = "0 0 48px rgba(251,191,36,0.08)";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(10,8,25,0.50)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow = "0 0 40px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "";
      }}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1 min-w-0">
          {/* 菱形装饰 + 标题 */}
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-2 h-2 bg-amber-400/50 rotate-45 shrink-0
                         group-hover/card:bg-amber-400/80 transition-colors"
              style={{ boxShadow: "0 0 6px rgba(251,191,36,0.25)" }}
            />
            <h2 className="text-base font-semibold text-white/88 group-hover/card:text-white/98 transition-colors truncate"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
              {post.title}
            </h2>
          </div>

          {/* 描述 */}
          {post.description && (
            <p className="text-sm leading-relaxed mt-3 line-clamp-2 ml-5"
              style={{ color: "rgba(255,255,255,0.50)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
              {post.description}
            </p>
          )}
        </div>

        {/* 日期 + 箭头 */}
        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          <time className="text-xs whitespace-nowrap"
            style={{ color: "rgba(255,255,255,0.50)", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            {date}
          </time>
          <span className="text-white/20 group-hover/card:text-amber-400/70 group-hover/card:translate-x-1 transition-all text-sm">
            →
          </span>
        </div>
      </div>

      {/* 标签 */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 ml-5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 rounded-full border"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.55)",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
