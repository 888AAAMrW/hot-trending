"use client";

import { getAllTags } from "@/lib/blog";
import Link from "next/link";

export default function TagsPage() {
  const tags = getAllTags();
  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(22,16,50,0.52)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 16px 40px rgba(8,4,28,0.35)",
      }}
    >
      <h2
        className="text-sm tracking-[0.15em] mb-5"
        style={{
          color: "rgba(255,255,255,0.55)",
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        🏷️ 标签
      </h2>

      {tags.length === 0 ? (
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          暂无标签
        </p>
      ) : (
        <div className="flex flex-wrap gap-2.5 items-center">
          {tags.map(({ tag, count }) => {
            const ratio = count / maxCount; // 0..1
            const size = 0.7 + ratio * 0.45; // 0.7rem → 1.15rem
            const opacity = 0.35 + ratio * 0.45; // 0.35 → 0.80
            const glow = ratio > 0.6;

            return (
              <Link
                key={tag}
                href={`/blog/tags/${encodeURIComponent(tag)}`}
                className="rounded-full border transition-all duration-250 hover:scale-105 inline-flex items-center gap-1.5"
                style={{
                  fontSize: `${size}rem`,
                  padding: `${0.25 + ratio * 0.15}rem ${0.5 + ratio * 0.25}rem`,
                  background: glow
                    ? "rgba(160,140,220,0.14)"
                    : "rgba(255,255,255,0.04)",
                  borderColor: glow
                    ? "rgba(180,160,240,0.25)"
                    : "rgba(255,255,255,0.08)",
                  color: `rgba(255,255,255,${opacity})`,
                  textShadow: glow
                    ? "0 1px 3px rgba(0,0,0,0.4), 0 0 8px rgba(180,150,220,0.15)"
                    : "0 1px 2px rgba(0,0,0,0.3)",
                  boxShadow: glow
                    ? "0 0 8px rgba(160,140,220,0.06)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.90)";
                  e.currentTarget.style.borderColor = "rgba(200,170,240,0.45)";
                  e.currentTarget.style.background = "rgba(160,140,220,0.22)";
                  e.currentTarget.style.boxShadow = "0 0 14px rgba(180,150,220,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = `rgba(255,255,255,${opacity})`;
                  e.currentTarget.style.borderColor = glow
                    ? "rgba(180,160,240,0.25)"
                    : "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = glow
                    ? "rgba(160,140,220,0.14)"
                    : "rgba(255,255,255,0.04)";
                  e.currentTarget.style.boxShadow = glow
                    ? "0 0 8px rgba(160,140,220,0.06)"
                    : "none";
                }}
              >
                {tag}
                <span
                  style={{
                    fontSize: `${size * 0.75}rem`,
                    color: `rgba(255,255,255,${opacity * 0.6})`,
                  }}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
