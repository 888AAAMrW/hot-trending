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
      {/* 桌面端：视频背景 */}
      <div className="fixed inset-0 z-0 hidden md:block bg-gray-950">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/bg-compressed.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 移动端：竖图背景 */}
      <div className="fixed inset-0 z-0 block md:hidden bg-gray-950">
        <img
          src="/bg-mobile.jpg"
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        <BlogHeader />
        {children}
      </div>
    </div>
  );
}
