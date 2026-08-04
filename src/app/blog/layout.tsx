import type { Metadata } from "next";
import Link from "next/link";
import AtmosphereEffects from "@/components/blog/AtmosphereEffects";
import BlogNav from "@/components/blog/BlogNav";
import ProfileTags from "@/components/blog/ProfileTags";
import TimeOrb from "@/components/blog/TimeOrb";
import NowCard from "@/components/blog/NowCard";
import SocialIcons from "@/components/blog/SocialIcons";
import MobileIdentity from "@/components/blog/MobileIdentity";

export const metadata: Metadata = {
  title: {
    default: "深空博客",
    template: "%s — Starry Nova",
  },
  description: "技术笔记 · 思考碎片 · 星际日志",
};

function Diamond({ size = 6 }: { size?: number }) {
  return (
    <span
      className="inline-block bg-amber-400/50 rotate-45 shrink-0"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 ${size * 2}px rgba(251,191,36,0.25)`,
      }}
    />
  );
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ========== 桌面：横屏照片背景 ========== */}
      <div className="fixed inset-0 z-0 hidden md:block bg-gray-950">
        <img
          src="/assets/images/background-desktop.png"
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover animate-bg-fade-in"
        />
      </div>

      {/* ========== 移动：与桌面统一背景 ========== */}
      <div className="fixed inset-0 z-0 block md:hidden bg-gray-950">
        <img
          src="/assets/images/background-desktop.png"
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ========== 全局压暗垫层：半透明深色渐变 + 暗角 ========== */}
      <div className="fixed inset-0 z-[1] pointer-events-none" aria-hidden="true"
        style={{
          background: [
            /* 中心柔光过渡 */
            "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(5,3,18,0.38) 68%, rgba(3,2,14,0.52) 100%)",
            /* 底部加深 */
            "linear-gradient(to top, rgba(3,2,14,0.32) 0%, transparent 50%)",
            /* 顶部微压 */
            "linear-gradient(to bottom, rgba(3,2,14,0.16) 0%, transparent 30%)",
          ].join(", "),
        }} />

      {/* ========== 余烬特效 ========== */}
      <AtmosphereEffects />

      {/* ========== 顶部导航毛玻璃条 ========== */}
      <header className="fixed top-0 left-0 right-0 z-30 px-8 py-5 flex items-center justify-center
                        border-b border-white/[0.06]"
             style={{
               background: "linear-gradient(to right, rgba(20,25,50,0.02), rgba(20,25,50,0.12))",
               backdropFilter: "blur(6px)",
               WebkitBackdropFilter: "blur(6px)",
             }}>
        {/* 返回主站 — 左悬浮 */}
        <Link
          href="https://starrynova.cc"
          className="absolute left-8 group flex items-center gap-2 text-[13px] px-4 py-2 rounded-full
                     text-amber-100/85 hover:text-amber-50/95 tracking-[0.1em] transition-all duration-200"
          style={{
            fontFamily: "'Orbitron', monospace",
            background: "rgba(251,191,36,0.18)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(251,191,36,0.3)",
            boxShadow: "0 0 14px rgba(251,191,36,0.12)",
          }}
        >
          <span className="text-amber-100/70 group-hover:text-amber-50/90 transition-colors">←</span>
          Starry Nova
        </Link>
        <BlogNav />
      </header>

      {/* ========== 左侧浮层组 ========== */}
      <div className="fixed top-36 z-20 hidden md:flex flex-col items-center"
           style={{ left: "32px" }}>
        {/* 头像 */}
        <div className="w-44 h-44 rounded-full overflow-hidden shrink-0 bg-white/[0.03]"
             style={{
               border: "2px solid rgba(255,150,180,0.3)",
               boxShadow: "0 0 24px rgba(0,0,0,0.3), 0 0 18px rgba(255,150,180,0.15)",
             }}>
          <img
            src="/assets/images/avatar.png"
            alt="avatar"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 10%" }}
          />
        </div>

        {/* 标签卡 */}
        <div className="rounded-2xl p-4 relative mt-8"
             style={{
               width: "256px",
               background: "rgba(255,255,255,0.07)",
               backdropFilter: "blur(4px)",
               WebkitBackdropFilter: "blur(4px)",
               border: "1px solid rgba(255,150,180,0.18)",
               boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,150,180,0.06)",
             }}>
          {/* 四角装饰线 */}
          <span className="absolute top-3 left-3 w-3 h-px bg-white/[0.15]" />
          <span className="absolute top-3 left-3 w-px h-3 bg-white/[0.15]" />
          <span className="absolute top-3 right-3 w-3 h-px bg-white/[0.15]" />
          <span className="absolute top-3 right-3 w-px h-3 bg-white/[0.15]" />
          <span className="absolute bottom-3 left-3 w-3 h-px bg-white/[0.15]" />
          <span className="absolute bottom-3 left-3 w-px h-3 bg-white/[0.15]" />
          <span className="absolute bottom-3 right-3 w-3 h-px bg-white/[0.15]" />
          <span className="absolute bottom-3 right-3 w-px h-3 bg-white/[0.15]" />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white/60 tracking-[0.15em]">
              🍬 成分表
            </span>
            <span className="text-[10px] text-white/30">per 100g</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] via-transparent to-transparent" />
          </div>
          <ProfileTags />
        </div>

        {/* NowCard */}
        <div className="mt-8">
          <NowCard />
        </div>
      </div>

      {/* ========== 右上区：时钟 — 与导航右缘对齐 ========== */}
      <div className="fixed z-20 hidden md:block"
           style={{ top: "96px", right: "32px" }}>
        <TimeOrb />
      </div>

      {/* ========== 右下角：社交图标 ========== */}
      <div className="fixed z-20 hidden md:block"
           style={{ bottom: "32px", right: "32px" }}>
        <SocialIcons />
      </div>

      {/* ========== 内容区 ========== */}
      <main className="relative z-10 pt-10 md:pt-12 pb-24 md:pb-16 px-5 md:px-0
                      md:max-w-4xl md:mx-auto">
        {/* 移动端身份区（头像+时钟+标签） */}
        <MobileIdentity />
        {children}
      </main>

      {/* ========== 移动端底部品牌 ========== */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-10 p-5 text-center
                         bg-black/20 backdrop-blur-xl border-t border-white/[0.05]">
        <div className="flex items-center justify-center gap-2">
          <Diamond size={5} />
          <p className="text-xs text-white/40 tracking-[0.12em]">深空博客</p>
        </div>
      </footer>
    </>
  );
}
