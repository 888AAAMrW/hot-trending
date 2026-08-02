import type { Metadata } from "next";
import Link from "next/link";
import AtmosphereEffects from "@/components/AtmosphereEffects";
import BlogNav from "@/components/BlogNav";
import ProfileTags from "@/components/ProfileTags";
import TimeOrb from "@/components/TimeOrb";
import ColorWheel from "@/components/ColorWheel";

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
          className="w-full h-full object-cover"
        />
      </div>

      {/* ========== 移动：图片背景 ========== */}
      <div className="fixed inset-0 z-0 block md:hidden bg-gray-950">
        <img
          src="/assets/images/background-mobile.jpg"
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ========== 余烬特效 ========== */}
      <AtmosphereEffects />

      {/* ========== 顶部导航毛玻璃条 ========== */}
      <header className="fixed top-0 left-0 right-0 z-30 px-8 py-4 flex items-center justify-between
                        bg-white/[0.02] backdrop-blur-md">
        <Link
          href="https://starrynova.cc"
          className="group flex items-center gap-2.5"
        >
          <Diamond size={6} />
          <span className="text-[11px] text-white/30 group-hover:text-white/50 transition-colors tracking-[0.18em] uppercase">
            Starry Nova
          </span>
        </Link>
        <BlogNav />
      </header>

      {/* ========== 左侧浮层组 ========== */}
      <aside className="fixed top-36 left-10 z-20 hidden md:flex flex-col items-center gap-5 w-56">
        {/* 头像 — 替换 /assets/images/avatar.png 即可 */}
        <div className="w-36 h-36 rounded-full border-2 border-white/[0.08] overflow-hidden
                        shadow-[0_0_24px_rgba(0,0,0,0.3)] shrink-0
                        bg-white/[0.03]">
          <img
            src="/assets/images/avatar.png"
            alt="avatar"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 10%" }}
          />
        </div>

        {/* 标签卡 — 糯米纸质感 */}
        <div className="rounded-2xl p-4 w-full"
             style={{
               background: "rgba(255,255,255,0.07)",
               backdropFilter: "blur(4px)",
               WebkitBackdropFilter: "blur(4px)",
               border: "1px solid rgba(255,255,255,0.07)",
               boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
             }}>
          {/* 头部：成分表标题 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white/60 tracking-[0.15em]">
              🍬 成分表
            </span>
            <span className="text-[10px] text-white/30">per 100g</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] via-transparent to-transparent" />
          </div>
          {/* 标签内容区 */}
          <ProfileTags />
        </div>
      </aside>

      {/* ========== 右上角：时钟光环 ========== */}
      <div className="fixed top-20 right-8 z-20 hidden md:block">
        <TimeOrb />
      </div>

      {/* ========== 左下角：彩色轮盘 ========== */}
      <div className="fixed bottom-8 left-10 z-20 hidden md:block">
        <ColorWheel />
      </div>

      {/* ========== 内容区：居中 ========== */}
      <main className="relative z-10 pt-10 md:pt-12 pb-24 md:pb-16 px-5 md:px-0
                      md:max-w-xl md:mx-auto">
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
