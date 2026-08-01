import type { Metadata } from "next";
import BlogHeader from "@/components/BlogHeader";

export const metadata: Metadata = {
  title: {
    default: "深空博客",
    template: "%s — Starry Nova",
  },
  description: "技术笔记 · 思考碎片 · 星际日志",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* 星空背景占位 — 复用全局 bg-surface-base */}
      <div className="relative z-10">
        <BlogHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
